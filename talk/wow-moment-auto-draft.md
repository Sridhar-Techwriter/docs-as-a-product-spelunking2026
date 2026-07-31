# Bonus "Wow Moment": Auto-Drafting Docs from a Sample Request/Response

This is an optional second demo beat, built on top of the core CI/CD story.
It answers a natural audience question: "Fine, the pipeline builds the docs
site automatically — but who writes all those field descriptions?" This
tool shows the *next* step: even the first draft of those descriptions can
be generated automatically from real API traffic, with a human reviewing
before it ships.

## What it does

`demo/scripts/draft-endpoint.js` takes:
- a `curl` command (the exact request an engineer already used to test their endpoint), and
- a sample JSON response (and optionally a sample request body)

...and produces a fully formatted OpenAPI operation: the correct path with
path parameters detected automatically, inferred field types (`string`,
`integer`, `boolean`, `array`, `object`, plus formats like `email`, `uri`,
`date-time`), and a plain-English description drafted for every single
field, based on naming patterns (`id`, `*Id`, `*Url`, `*email`, `status`,
`createdAt`, `is*`/`has*`, `*count`, etc.).

It runs **100% locally** — no API key, no network call, no dependency on
venue Wi-Fi. That's a deliberate choice: it makes this safe to run live on
stage, unlike an LLM-API-powered version which would introduce network risk
during a lightning talk.

It is a **draft** generator, not a publisher. It prints (or writes to a
review file) rather than silently overwriting the source of truth — mirroring
the real workflow: automation drafts, a human (engineer or writer) reviews
and merges. Every output is stamped with a comment banner saying exactly
that.

## Try it yourself

```bash
cd demo
npm run draft-endpoint -- \
  --curl "curl -X POST https://api.example-orbit.workday.com/v1/webhooks/whk_3a90/resume -H 'Authorization: Bearer \$ORBIT_ACCESS_TOKEN'" \
  --response '{"id":"whk_3a90","partnerId":"partner_8842","targetUrl":"https://acme.example.com/hooks/orbit","eventTypes":["worker.hired","job.posted"],"status":"active"}' \
  --summary "Resume a Webhook Subscription" \
  --tag Webhooks
```

This prints a ready-to-paste OpenAPI block to your terminal. Review it, then
paste it under `paths:` in `openapi/orbit-platform-api.yaml`.

### Flags

| Flag | Required? | Purpose |
|---|---|---|
| `--curl` | Yes | The curl command. Use `@path/to/file.txt` to load from a file instead of inline (handy for long commands). |
| `--response` | Yes | Sample JSON response body. Use `@path/to/file.json` for a file. |
| `--request` | No | Sample JSON request body, for POST/PUT/PATCH endpoints. |
| `--summary` | No | Human title for the operation. Defaults to a guess from the method/path. |
| `--tag` | No | Sidebar group name. Defaults to a guess from the URL's first segment. |
| `--status` | No | Success status code. Defaults to `200`, or `201` if `--request` is given. |
| `--out <path>` | No | Write the draft to a file instead of printing it. |
| `--write` | No | **Append the draft directly into `openapi/orbit-platform-api.yaml`.** Combine with the already-running `npm run docs:preview` for an instant "watch it appear" moment. |

## Suggested live-demo flow (optional second beat, ~2 minutes)

Use this *after* the main retry-policy demo (see `demo-script.md`), if you have time and want a second, distinct wow:

1. With `npm run docs:preview` already running (from the main demo), open a fresh terminal tab.
2. Say: "That was the pipeline. Here's where it goes next — even the writing itself can get a head start." 
3. Run the exact command above with `--write` added at the end.
4. Switch to the browser: the "Resume a Webhook Subscription" page is now live in the preview, fully formatted, with a real parameter table and field descriptions — generated from nothing but a curl command and a JSON blob.
5. Say: "Nobody hand-wrote those descriptions. But nobody should ship them blind either — that banner at the top says 'review before merging,' because good judgment about what's actually true is still a human job. Automation didn't remove the writer. It moved the writer's time from typing to judgment."
6. Afterward, revert so the repo stays clean for next time:
   ```bash
   git checkout -- openapi/orbit-platform-api.yaml
   ```

## Known limitations (be ready for Q&A)

- It infers types and drafts *plausible* descriptions from naming conventions — it does not know your actual business logic. A field named `status` gets a generic description; a human still needs to fill in the real list of valid values and what each one means.
- Path-parameter detection is heuristic (numbers, underscores, or long mixed-case tokens are treated as IDs). It works well for REST APIs with predictable ID formats like this demo's, but should always be double-checked.
- It's a v1 proof of concept, not a production tool — the natural next step (mentioned as a roadmap idea, not built here) would be swapping the naming-pattern heuristics for a real LLM call to draft even richer, more contextual descriptions, with the same "human reviews before merge" guardrail.
