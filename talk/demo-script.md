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
   - **Editor** open to `demo/openapi/orbit-platform-api.yaml`, scrolled to the `Webhook` schema. Use `Cmd+F` and search for `enum: [active, paused]` to jump straight to the right spot every time.
   - **Browser tab A**: the live docs preview (local), scrolled/navigated to the `Webhook` schema section.
   - **Browser tab B**: the real, live deployed docs site — https://sridhar-techwriter.github.io/docs-as-a-product-spelunking2026/ — as your "in production" proof point. This is a genuine GitHub Actions pipeline that lints, builds, and deploys on every push; it is not a mockup.
   - Have `talk/demo-backup.png` (a screenshot of the end-state docs) open in a Preview window as a silent fallback if live editing breaks.

5. Zoom in! Bump your editor and browser font size up (18–20pt+) before you start — this is the single most common live-demo failure (nobody in row 10 can read 12pt text).

## On stage: step by step

**Step 1 — Orient the audience (10s)**
Say: "Here's the current published docs for our fictional Orbit Platform API — this is what a partner developer sees today." Point at the `Webhook` object in the docs preview tab. Show it has no payload-signing/security behavior documented yet.

**Step 2 — Make the change (30–60s)**
Switch to the editor. Find the `Webhook` schema in `demo/openapi/orbit-platform-api.yaml` (search `Cmd+F` for `enum: [active, paused]`). Click at the **end of the line** that says `example: active` (right after the word `active`), press Enter, and paste in this single block — it's deliberately just one paste, one location, to avoid indentation mix-ups on stage:

```yaml
        signingSecret:
          type: string
          description: |
            A secret used to sign every webhook payload with an HMAC-SHA256
            signature, sent in the `Orbit-Signature` header, so partners can
            verify a delivery genuinely came from Orbit. Added live during
            the Spelunking 2026 "Docs-as-a-Product" demo — this text reached
            this page with zero manual doc edits.
          example: whsec_9f3a1c2b8e77
```

**Indentation check:** the pasted block should line up so that `signingSecret:` starts at the exact same position as `status:` and `retryPolicy:` just above it in the file (8 spaces in). If your editor auto-indented it differently after you pressed Enter, just use Tab/Backspace to nudge it left or right until it visually lines up with `retryPolicy:`.

Say while typing/pasting: "I'm an engineer. I just shipped webhook payload signing. The *only* thing I'm touching is this spec file — I am not opening a docs tool, a CMS, or pinging a technical writer."

**Step 3 — Save and reveal (20–30s)**
Save the file. Switch to the browser preview tab. It should auto-refresh within a second or two, now showing the new `signingSecret` field on `Webhook` with your description text rendered.

Say: "That's it. That's the whole 'documentation update.' No writer typed a word. No ticket got filed. The description you're reading came from the same file the engineer just edited."

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
