#!/usr/bin/env node
/**
 * draft-endpoint.js
 *
 * The "wow moment" tool for the Docs-as-a-Product talk: paste in a curl
 * command plus a sample JSON response (and optionally a sample request
 * body), and this script drafts a complete, formatted OpenAPI operation —
 * path parameters, request/response schemas, and human-readable
 * descriptions — inferred entirely from field names and value shapes.
 *
 * This runs 100% locally with no network calls and no API keys, so it is
 * safe to run live on stage with unreliable venue Wi-Fi.
 *
 * It is intentionally a DRAFT generator, not a publisher: the output is
 * printed (or written to a review file) for a human to read, adjust, and
 * merge — the same way a technical writer reviews AI-drafted prose before
 * it ships. That's a feature, not a limitation: automation drafts, humans
 * approve.
 *
 * Usage:
 *   node scripts/draft-endpoint.js \
 *     --curl "curl -X POST https://api.example.com/v1/webhooks/whk_3a90/resume -H 'Authorization: Bearer $TOKEN'" \
 *     --response '{"id":"whk_3a90","status":"active"}' \
 *     --summary "Resume a Webhook Subscription" \
 *     --tag Webhooks
 *
 * Flags:
 *   --curl <string|@file>       Required. The curl command (inline or @path/to/file.txt).
 *   --response <string|@file>   Required. Sample JSON response body (inline or @path/to/file.json).
 *   --request <string|@file>    Optional. Sample JSON request body, for POST/PUT/PATCH.
 *   --summary <string>          Optional. Human title for the operation. Defaults to a guess.
 *   --tag <string>              Optional. Tag/group name. Defaults to a guess from the URL.
 *   --status <code>             Optional. Success status code. Defaults to 200 (or 201 if a request body is present).
 *   --out <path>                Optional. Write the draft to this file instead of stdout.
 *   --write                     Optional. Append the draft directly into openapi/orbit-platform-api.yaml.
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function readArgValue(raw) {
  if (raw && raw.startsWith("@")) {
    return fs.readFileSync(raw.slice(1), "utf8");
  }
  return raw;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true; // boolean flag
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function parseCurl(curlTextRaw) {
  const curlText = curlTextRaw.replace(/\\\r?\n/g, " ").trim();

  // Pull out -H headers first so header values don't get mistaken for the URL.
  const headers = [];
  const headerRegex = /-H\s+(['"])([\s\S]*?)\1/g;
  let strippedForUrl = curlText;
  let match;
  while ((match = headerRegex.exec(curlText)) !== null) {
    headers.push(match[2]);
    strippedForUrl = strippedForUrl.replace(match[0], " ");
  }

  const methodMatch = curlText.match(/-X\s+([A-Za-z]+)/);
  const dataMatch = curlText.match(/(?:-d|--data(?:-raw)?)\s+(['"])([\s\S]*)\1\s*$/);

  const urlMatch = strippedForUrl.match(/(https?:\/\/[^\s'"]+)/);
  if (!urlMatch) {
    throw new Error("Could not find a URL (https://...) in the curl command.");
  }
  const url = urlMatch[1];
  const method = (methodMatch ? methodMatch[1] : dataMatch ? "POST" : "GET").toUpperCase();

  return { method, url, headers, body: dataMatch ? dataMatch[2] : null };
}

function singularize(word) {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function toPascalCase(word) {
  return word
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function toCamelCase(word) {
  const pascal = toPascalCase(word);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function humanize(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase();
}

function isVersionSegment(segment) {
  return /^v\d+(\.\d+)?$/i.test(segment);
}

function isDynamicSegment(segment) {
  if (/^\{.*\}$/.test(segment)) return true;
  if (isVersionSegment(segment)) return false;
  if (/\d/.test(segment)) return true;
  if (/_/.test(segment)) return true;
  if (segment.length > 12 && /^[a-zA-Z0-9]+$/.test(segment) && !/^[a-z]+$/.test(segment)) return true;
  return false;
}

function extractPathTemplate(url) {
  const parsed = new URL(url);
  // Version segments (e.g. "v1") belong in the server base URL, not the
  // OpenAPI path, so drop them entirely rather than templating them.
  const segments = parsed.pathname.split("/").filter((s) => s && !isVersionSegment(s));
  const params = [];
  const staticSegments = [];
  const templated = segments.map((segment, i) => {
    if (!isDynamicSegment(segment)) {
      staticSegments.push(segment);
      return segment;
    }
    const precedingStatic = [...segments.slice(0, i)].reverse().find((s) => !isDynamicSegment(s));
    const base = precedingStatic ? singularize(precedingStatic) : "resource";
    const paramName = toCamelCase(base) + "Id";
    params.push({ name: paramName, example: segment, resource: base });
    return `{${paramName}}`;
  });
  return { pathTemplate: "/" + templated.join("/"), staticSegments, params };
}

function describeField(key, inferred, resourceSingular) {
  const lower = key.toLowerCase();
  const readable = humanize(key);

  if (lower === "id") return `Unique identifier for the ${resourceSingular}.`;
  if (/id$/i.test(key) && lower !== "id") {
    const related = humanize(key.replace(/id$/i, ""));
    return `The unique identifier of the related ${related}.`;
  }
  if (/email/i.test(key)) return `Email address associated with the ${resourceSingular}.`;
  if (/url$/i.test(key)) {
    const subject = readable.replace(/\s*url$/, "");
    return subject ? `The HTTPS URL used for the ${subject}.` : "The HTTPS URL.";
  }
  if (lower === "status" || lower === "state") {
    return `The current status of the ${resourceSingular}. See possible values above; confirm the full list with the API owner before publishing.`;
  }
  if (/(createdat|updatedat|_at$|at$)/i.test(lower) && inferred.format === "date-time") {
    return `Date and time the ${resourceSingular} was ${lower.replace(/at$/, "")}d, in ISO 8601 / RFC 3339 format (UTC).`;
  }
  if (/^(is|has)[A-Z_]/.test(key)) {
    return `Whether ${humanize(key.replace(/^(is|has)/, ""))}.`;
  }
  if (/count$|total$/i.test(key)) return `The number of ${humanize(key.replace(/count$|total$/i, ""))}.`;
  if (/name$/i.test(key)) return `Display name of the ${resourceSingular}.`;
  if (inferred.type === "array") return `A list of ${readable}.`;
  if (inferred.type === "object") return `Details about ${readable}.`;
  return `The ${readable} value.`;
}

function inferSchema(value, keyName, resourceSingular) {
  if (value === null) {
    return { type: "string", nullable: true, description: `The ${humanize(keyName || "value")} value.`, example: null };
  }
  if (Array.isArray(value)) {
    const itemSchema = value.length > 0 ? inferSchema(value[0], keyName, resourceSingular) : { type: "string" };
    delete itemSchema.description;
    return {
      type: "array",
      description: describeField(keyName || "items", { type: "array" }, resourceSingular),
      items: itemSchema,
      example: value,
    };
  }
  if (typeof value === "object") {
    const properties = {};
    const required = [];
    for (const [childKey, childValue] of Object.entries(value)) {
      properties[childKey] = inferSchema(childValue, childKey, resourceSingular);
      required.push(childKey);
    }
    return {
      type: "object",
      description: keyName ? describeField(keyName, { type: "object" }, resourceSingular) : undefined,
      properties,
      required,
    };
  }
  if (typeof value === "number") {
    const type = Number.isInteger(value) ? "integer" : "number";
    const schema = { type, example: value };
    schema.description = describeField(keyName, schema, resourceSingular);
    return schema;
  }
  if (typeof value === "boolean") {
    const schema = { type: "boolean", example: value };
    schema.description = describeField(keyName, schema, resourceSingular);
    return schema;
  }
  // string — sniff common formats
  const schema = { type: "string", example: value };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) schema.format = "email";
  else if (/^https?:\/\//.test(value)) schema.format = "uri";
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) schema.format = "date-time";
  schema.description = describeField(keyName, schema, resourceSingular);
  return schema;
}

function guessOperationId(method, staticSegments, resourceSingular, hasPathParam) {
  const resourcePlural = staticSegments[0] || resourceSingular;
  const lastSegment = staticSegments[staticSegments.length - 1];
  const isActionVerb = staticSegments.length > 1 && lastSegment !== resourcePlural;

  if (isActionVerb) {
    return toCamelCase(`${lastSegment} ${resourceSingular}`);
  }
  const verbByMethod = { GET: hasPathParam ? "get" : "list", POST: "create", PUT: "update", PATCH: "update", DELETE: "delete" };
  const verb = verbByMethod[method] || method.toLowerCase();
  const noun = verb === "list" ? resourcePlural : resourceSingular;
  return toCamelCase(`${verb} ${noun}`);
}

function buildOperation(opts) {
  const { method, pathTemplate, params, staticSegments, tag, summary, requestBody, responseBody, statusCode, curlSource, resourceSingular } = opts;

  const operation = {
    operationId: guessOperationId(method, staticSegments, resourceSingular, params.length > 0),
    tags: [tag],
    summary,
    description: `${summary}. Drafted automatically from a sample request/response — review this description and refine before publishing.`,
    "x-codeSamples": [{ lang: "Shell", label: "cURL", source: curlSource }],
  };

  if (params.length > 0) {
    operation.parameters = params.map((p) => ({
      name: p.name,
      in: "path",
      required: true,
      description: `The unique identifier of the ${p.resource}.`,
      schema: { type: "string" },
      example: p.example,
    }));
  }

  if (requestBody) {
    const schema = inferSchema(requestBody, null, resourceSingular);
    operation.requestBody = {
      required: true,
      content: { "application/json": { schema, examples: { Example: { value: requestBody } } } },
    };
  }

  const responseSchema = inferSchema(responseBody, null, resourceSingular);
  operation.responses = {
    [statusCode]: {
      description: `${summary} succeeded.`,
      content: {
        "application/json": {
          schema: responseSchema,
          examples: { Success: { value: responseBody } },
        },
      },
    },
    "401": {
      description: "The access token is missing, expired, or invalid.",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: { Unauthorized: { value: { code: "unauthorized", message: "The access token is missing or invalid." } } },
        },
      },
    },
    "404": {
      description: `No ${resourceSingular} exists with the given identifier.`,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: { NotFound: { value: { code: `${resourceSingular}_not_found`, message: `No ${resourceSingular} found with the given id.` } } },
        },
      },
    },
  };

  return operation;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.curl || !args.response) {
    console.error("Usage: node scripts/draft-endpoint.js --curl <curl command|@file> --response <json|@file> [--request <json|@file>] [--summary \"...\"] [--tag Tag] [--status 200] [--out path] [--write]");
    process.exit(1);
  }

  const curlSource = readArgValue(args.curl).trim();
  const { method, url } = parseCurl(curlSource);
  const { pathTemplate, params, staticSegments } = extractPathTemplate(url);

  const responseBody = JSON.parse(readArgValue(args.response));
  const requestBody = args.request ? JSON.parse(readArgValue(args.request)) : null;

  const pathParts = pathTemplate.split("/").filter(Boolean);
  const firstStaticSegment = pathParts.find((s) => !s.startsWith("{")) || "resource";
  const guessedTag = toPascalCase(singularize(firstStaticSegment));
  const tag = typeof args.tag === "string" ? args.tag : guessedTag + "s";
  const resourceSingular = singularize(firstStaticSegment);
  const summary = typeof args.summary === "string" ? args.summary : `${toPascalCase(method)} ${humanize(pathTemplate)}`;
  const statusCode = typeof args.status === "string" ? args.status : requestBody ? "201" : "200";

  const operation = buildOperation({
    method,
    pathTemplate,
    params,
    staticSegments,
    tag,
    summary,
    requestBody,
    responseBody,
    statusCode,
    curlSource,
    resourceSingular,
  });

  const draft = { [pathTemplate]: { [method.toLowerCase()]: operation } };

  const yamlBody = yaml.dump(draft, { lineWidth: -1, noRefs: true });
  const banner =
    "# ⚠️  AUTO-DRAFTED by scripts/draft-endpoint.js — inferred from a sample request/response.\n" +
    "# Review every description, operationId, tag, and error case below before merging into\n" +
    "# openapi/orbit-platform-api.yaml. This is a first draft, not a final answer.\n\n";
  const output = banner + yamlBody;

  if (args.write) {
    const specPath = path.join(__dirname, "..", "openapi", "orbit-platform-api.yaml");
    const original = fs.readFileSync(specPath, "utf8");
    const marker = "\npaths:\n";
    const idx = original.indexOf(marker);
    if (idx === -1) throw new Error("Could not find 'paths:' section in the spec file.");
    const insertAt = idx + marker.length;
    const indentedBlock =
      yamlBody
        .split("\n")
        .map((line) => (line.length ? "  " + line : line))
        .join("\n") + "\n";
    const updated = original.slice(0, insertAt) + indentedBlock + original.slice(insertAt);
    fs.writeFileSync(specPath, updated);
    console.log(`Draft appended directly into ${specPath}`);
    console.log("Run `npm run lint` and check the local preview to review it.");
  } else if (args.out) {
    fs.writeFileSync(args.out, output);
    console.log(`Draft written to ${args.out}`);
  } else {
    console.log(output);
  }
}

main();
