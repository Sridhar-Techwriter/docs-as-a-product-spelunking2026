# Live Demo Runbook

Goal: in ~4 minutes on stage, show a spec change instantly becoming updated public
developer docs, with **zero manual doc editing**. This is designed to be low-risk
for a lightning talk — you paste a pre-written snippet rather than typing an
OpenAPI change from scratch under pressure.

## Before you go on stage (do this the morning of / at the venue)

1. Install dependencies once, ahead of time (needs real internet, not guaranteed at venue Wi-Fi):

   ```bash
   cd demo
   npm install
   ```

2. Confirm the spec lints clean:

   ```bash
   npm run lint
   ```

3. Start the local preview server **before** you're on stage and leave it running in a browser tab:

   ```bash
   npm run docs:preview
   ```

   This opens a live-reloading docs preview (default `http://127.0.0.1:8080`). Redocly's
   preview server watches the spec file and refreshes automatically on save —
   this is what makes the "instant update" moment work live, with no network dependency.

4. Have three windows/tabs pre-arranged and ready to alt-tab between:
   - **Editor** open to `demo/openapi/orbit-platform-api.yaml`, scrolled to the `Webhook` schema (around the `WebhookCreateRequest` section).
   - **Browser tab A**: the live docs preview, scrolled/navigated to the `Webhook` schema section.
   - **Browser tab B** (optional stretch goal): a pre-run successful GitHub Actions run for `publish-docs.yml`, and/or the deployed GitHub Pages docs URL, as your "in production" proof point.
   - Have `talk/demo-backup.png` (a screenshot of the end-state docs) open in a Preview window as a silent fallback if live editing breaks.

5. Zoom in! Bump your editor and browser font size up (18–20pt+) before you start — this is the single most common live-demo failure (nobody in row 10 can read 12pt text).

## On stage: step by step

**Step 1 — Orient the audience (10s)**
Say: "Here's the current published docs for our fictional Orbit Platform API — this is what a partner developer sees today." Point at the `Webhook` object in the docs preview tab. Show it has no retry behavior documented.

**Step 2 — Make the change (60–90s)**
Switch to the editor. Find the `Webhook` schema in `demo/openapi/orbit-platform-api.yaml`. Paste in the following block as a new property inside `Webhook.properties` (right after `status`):

```yaml
        retryPolicy:
          $ref: "#/components/schemas/WebhookRetryPolicy"
```

Then scroll to the `components.schemas` section and paste in this new schema, anywhere alongside the other schemas (e.g. right after the `Webhook` schema block):

```yaml
    WebhookRetryPolicy:
      type: object
      description: |
        Controls how Orbit retries webhook delivery after a failed attempt.
        Added live during the Spelunking 2026 "Docs-as-a-Product" demo —
        this text reached this page with zero manual doc edits.
      properties:
        maxAttempts:
          type: integer
          example: 5
        backoffSeconds:
          type: integer
          description: Delay before the next retry attempt, in seconds.
          example: 30
        deadLetterUrl:
          type: string
          format: uri
          description: Optional URL that receives permanently failed deliveries.
          example: https://acme.example.com/hooks/orbit/dead-letter
      required: [maxAttempts, backoffSeconds]
```

Say while typing/pasting: "I'm an engineer. I just shipped retry support for webhooks. The *only* thing I'm touching is this spec file — I am not opening a docs tool, a CMS, or pinging a technical writer."

**Step 3 — Save and reveal (20–30s)**
Save the file. Switch to the browser preview tab. It should auto-refresh within a second or two, now showing the `retryPolicy` field on `Webhook` and the new `WebhookRetryPolicy` schema with your description text rendered.

Say: "That's it. That's the whole 'documentation update.' No writer typed a word. No ticket got filed. The description you're reading came from the same file the engineer just edited."

**Step 4 — Connect to production (30–45s)**
Switch to the GitHub Actions workflow file (`.github/workflows/publish-docs.yml`) or the pre-run Actions success screenshot / live Pages URL. Say: "Locally this took a second because Redocly watches the file. In production, this exact same spec change triggers our CI/CD pipeline — it lints the spec, rebuilds the docs site, and redeploys it to our public developer portal automatically, on every merge to main."

**Step 5 — Land it (10s)**
Say: "One file changed. Zero manual docs work. That's Docs-as-a-Product." Switch back to slides.

## Fallback plan (if live demo breaks)

- **Wi-Fi/network issue:** Not a problem — `docs:preview` runs fully local, no internet needed once `npm install` has already been run.
- **Typo/YAML error breaks the preview:** Redocly preview will show an inline error instead of crashing. Calmly say "let's fix that live" and correct it — or, if time is short, `git checkout` the pristine spec and switch straight to the backup screenshot (`talk/demo-backup.png`) while narrating what *would* have appeared.
- **Totally dead laptop/AV:** Narrate over the backup screenshot as if it were live: "Here's what just happened when I made this change earlier..." and move on. Never spend more than ~20 seconds troubleshooting in front of the room.

## After the talk

Revert the demo repo's spec back to its clean state (or just don't commit the live change) so the next rehearsal/run starts from the same baseline:

```bash
git checkout -- demo/openapi/orbit-platform-api.yaml
```
