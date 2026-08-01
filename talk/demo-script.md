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
   - **Editor** open to `demo/openapi/orbit-platform-api.yaml`, scrolled to the end of the `/webhooks/{webhookId}/pause` operation, right before `/events:`. Use `Cmd+F` and search for `AlreadyPaused` to jump straight to the right spot every time.
   - **Browser tab A**: the live docs preview (local), with the **Webhooks** section expanded in the left sidebar so the audience can see today's operations: Register, Pause.
   - **Browser tab B**: the real, live deployed docs site — https://sridhar-techwriter.github.io/docs-as-a-product-spelunking2026/ — as your "in production" proof point. This is a genuine GitHub Actions pipeline that lints, builds, and deploys on every push; it is not a mockup.
   - Have `talk/demo-backup.png` (a screenshot of the end-state docs) open in a Preview window as a silent fallback if live editing breaks.

5. Zoom in! Bump your editor and browser font size up (18–20pt+) before you start — this is the single most common live-demo failure (nobody in row 10 can read 12pt text).

## On stage: step by step

**Step 1 — Orient the audience (10s)**
Say: "Here's the current published docs for our fictional Orbit Platform API — this is what a partner developer sees today." Point at the **Webhooks** section in the sidebar of the docs preview tab. Show it only has two operations today: *Register a Webhook Subscription* and *Pause a Webhook Subscription*. "Notice there's no way for a partner to check their integration actually works before going live."

**Step 2 — Make the change (45–75s)**
Switch to the editor. Scroll to the end of the `/webhooks/{webhookId}/pause` operation in `demo/openapi/orbit-platform-api.yaml` (search `Cmd+F` for `AlreadyPaused` — that's the last line of the Pause operation, right before `/events:`). Click at the **end of that line**, press Enter, and paste in this single block — it's a whole new operation, but it's still just one paste, one location:

```yaml
  /webhooks/{webhookId}/test:
    post:
      operationId: testWebhook
      tags: [Webhooks]
      summary: Test a Webhook Subscription
      description: |
        Sends a sample event payload to the webhook's `targetUrl`, so a
        partner can verify their integration works correctly without
        waiting for a real event to occur. Added live during the
        Spelunking 2026 "Docs-as-a-Product" demo — this entire page
        reached the public docs with zero manual doc edits.

        The webhook must be `active` — testing a `paused` webhook returns
        a `409` error.
      x-codeSamples:
        - lang: Shell
          label: cURL
          source: |
            curl -X POST https://api.example-orbit.workday.com/v1/webhooks/whk_3a90/test \
              -H "Authorization: Bearer $ORBIT_ACCESS_TOKEN"
      parameters:
        - $ref: "#/components/parameters/WebhookId"
      responses:
        "200":
          description: The test request completed. Check `delivered` to see whether the target actually accepted it.
          content:
            application/json:
              schema:
                type: object
                properties:
                  delivered:
                    type: boolean
                    description: Whether the target responded with a `2xx` status within 10 seconds.
                    example: true
                  statusCode:
                    type: integer
                    description: The HTTP status code returned by `targetUrl` for this test attempt.
                    example: 200
                  eventType:
                    type: string
                    description: The event type used to build the sample test payload, drawn from the webhook's `eventTypes`.
                    example: worker.hired
                  attemptedAt:
                    type: string
                    format: date-time
                    description: The date and time the test delivery was attempted, in ISO 8601 / RFC 3339 format (UTC).
                    example: "2026-01-15T09:31:00Z"
                required: [delivered, statusCode, eventType, attemptedAt]
              examples:
                Delivered:
                  summary: Target accepted the test event
                  value:
                    delivered: true
                    statusCode: 200
                    eventType: worker.hired
                    attemptedAt: "2026-01-15T09:31:00Z"
        "404":
          description: No webhook subscription exists with the given `webhookId`.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
              examples:
                NotFound:
                  value:
                    code: webhook_not_found
                    message: "No webhook found with id 'whk_3a90'."
        "409":
          description: The webhook is paused, so it cannot be tested.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
              examples:
                Paused:
                  value:
                    code: webhook_paused
                    message: "Webhook 'whk_3a90' is paused. Resume it before testing."
```

**Indentation check:** `/webhooks/{webhookId}/test:` (the very first line) must line up exactly under the `/` of `/webhooks/{webhookId}/pause:` above it (2 spaces in) — that's the only alignment that matters, since everything below it is pasted as one contiguous block and keeps its own internal indentation. If your editor auto-indented the first line differently after you pressed Enter, use Tab/Backspace to nudge just that first line left or right until `/webhooks...` lines up with the path lines above it.

Say while typing/pasting: "I'm an engineer. I just shipped a way to test-fire a webhook. The *only* thing I'm touching is this spec file — I am not opening a docs tool, a CMS, or pinging a technical writer."

**Step 3 — Save and reveal (20–30s)**
Save the file. Switch to the browser preview tab. It should auto-refresh within a second or two — a brand-new **Test a Webhook Subscription** entry appears in the Webhooks section of the sidebar, with full parameter tables, response schema, and a working code sample, all generated from nothing but the YAML you just pasted.

Say: "That's it. That's the whole 'documentation update' — for an entirely new endpoint. No writer typed a word. No ticket got filed. Everything you're reading came from the same file the engineer just edited."

**Step 4 — Connect to production (30–45s)**
Switch to Browser tab B, the real deployed site at https://sridhar-techwriter.github.io/docs-as-a-product-spelunking2026/. Say: "Locally this took a second because Redocly watches the file. This site right here is not a mockup — it's deployed by a real GitHub Actions pipeline that lints the spec, rebuilds the docs, and redeploys it automatically on every push to main." Optionally flip to the **Actions** tab in the repo to show the green checkmark run.

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
