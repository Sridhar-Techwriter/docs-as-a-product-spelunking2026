# Presentation Outline — "Docs-as-a-Product"

**Format:** Lightning talk, ~15–18 min content + 2–5 min Q&A (target total slot: 20 min)
**Slide count:** 12 slides (lean on purpose — this is a lightning talk, not a deep-dive)
**Delivery style:** Punchy, story-first, one live demo. Every slide should be readable in under 10 seconds so you're not reading to the audience.

> How to use this file: each `##` is one slide. "On slide" = what's visually on it. "Say" = speaker notes (paraphrase, don't read verbatim). Timings are cumulative targets, not hard stops — use them to pace, not to panic.

---

## Slide 1 — Title (0:00–0:30)

**On slide:**
- Title: *Docs-as-a-Product*
- Subtitle: *Engineering a Self-Service Developer Experience for Workday's Open Platform*
- Your name / role / team
- Track 3 · Open Technology Platform

**Say:**
"Quick show of hands — who here has ever integrated with an API, hit a wall, and the docs were wrong or just... missing? [pause] That's the problem I want to fix, and I'm going to show you a working pipeline that fixes it live, in the next 15 minutes."

---

## Slide 2 — The Cost of Friction (0:30–2:00)

**On slide:** A single stat/story, big and bold. Suggested framing (replace with a real or representative number if you have one):
- "Every hour a partner spends stuck on stale docs is an hour they're not integrating — and an hour our support queue grows."
- Visual: simple before/after or a broken-link/404 screenshot style graphic.

**Say:**
Tell a 30–45 second story: a partner or internal team hit outdated API docs, opened a support ticket, and the fix was "the docs are wrong," not "the API is wrong." Land the point: documentation debt is *platform* debt — it doesn't stay contained, it becomes engineering support cost and eroded customer trust.

---

## Slide 3 — Why Docs Break at Platform Scale (2:00–3:30)

**On slide:** Simple diagram of the traditional flow:

`Engineer ships API change → (weeks later, maybe) → Writer manually updates guide → Docs drift from reality`

Highlight the gap with a red arrow/label: "manual, reactive, invisible until it breaks."

**Say:**
"Today, documentation is treated like a to-do at the bottom of the sprint. It's manual, it's reactive, and it's disconnected from the actual build pipeline. That works when you have 5 APIs. It does not work when you're trying to scale an open platform to hundreds of partners in FY27."

---

## Slide 4 — Introducing Docs-as-a-Product (DaaP) (3:30–5:00)

**On slide:** Three pillars, one line each:
1. **Spec-driven** — the OpenAPI/AsyncAPI spec is the single source of truth.
2. **Automated** — docs are a build artifact, not a task.
3. **Self-service** — partners and internal teams never wait on a person to unblock them.

**Say:**
"Docs-as-a-Product means we stop treating documentation as content and start treating it as a *feature* of the platform — with the same engineering rigor as any other feature: it's built from source, tested, versioned, and shipped in CI/CD."

---

## Slide 5 — The Architecture (5:00–6:30)

**On slide:** A clean pipeline diagram (see `demo-script.md` for the exact visual to reuse from the demo repo):

`OpenAPI spec (in the code repo) → Lint & validate → Build docs site → Deploy → Public developer portal`

Callout: "No human retyping a single word."

**Say:**
Walk left to right in one breath: "The spec lives next to the code. The moment it changes, our pipeline lints it, builds a documentation site from it, and deploys it — automatically. What you're about to see is this exact pipeline, running live, against a real (if fictional) Workday-style platform API."

---

## Slide 6 — Demo Setup (6:30–7:00)

**On slide:** Minimal — just: "Live Demo" + the name of the sample API ("Orbit — Workday Open Platform API (fictional)").

**Say:**
"I'm going to make a real change to an API spec, right now, and show you the public docs update — with zero manual doc editing." (Then switch to screen share / demo environment. Full mechanics in `demo-script.md`.)

---

## Slide 7 — [SCREEN SHARE] Live Demo (7:00–11:00, ~4 min)

**On slide:** Nothing — you're on your terminal/editor/browser. Have a simple "Live Demo 🔴" title card ready to flash back to if something goes wrong and you need to recover.

**Say:** Follow `demo-script.md` step by step. Narrate as you go — silence during a live demo makes the audience nervous. Key beats to say out loud:
1. "Here's our current published docs — this is what a partner sees today."
2. "Now I, as an engineer, add a new field/endpoint to the OpenAPI spec — this is the *only* file I touch."
3. "I save, and locally the docs preview updates instantly — no doc tool, no manual step."
4. "In production this exact change triggers our GitHub Actions pipeline, which lints, builds, and redeploys the public developer portal automatically."
5. Show the pipeline YAML briefly or the pre-run Actions success screenshot (backup asset) as the "in production" proof point.

**Fallback:** If live editing fails or Wi-Fi dies, use the backup screenshots/recording described in `demo-script.md`. Never apologize for more than one sentence — keep moving.

---

## Slide 8 — What Just Happened (11:00–12:30)

**On slide:** Before/after split:
- **Before:** Engineer changes API → docs silently go stale → partner opens ticket → writer manually fixes → days of lag.
- **After:** Engineer changes spec → pipeline runs → docs are live → minutes of lag, zero manual typing.

**Say:**
"That update took less time than this slide transition. No ticket, no writer paged at 5pm, no partner blocked. The spec *is* the documentation source, and the pipeline is the only thing standing between a code change and a published guide."

---

## Slide 9 — Three Things to Do Monday Morning (12:30–14:30)

**On slide:** Three rows, one per audience (mirrors your submitted "calls to action"):

| Audience | Do this |
|---|---|
| **Engineers** | Wire your OpenAPI/AsyncAPI spec into your build so doc generation runs on every change, not on request. |
| **Product Managers** | Add "automated, self-service docs" to your Definition of Done — a feature isn't done if its docs require a manual step. |
| **P&T Leaders** | Fund docs tooling like platform infrastructure, not like a content backlog — it's what lets the ecosystem scale without linear headcount growth. |

**Say:**
Deliver each row as a direct, personal ask — pause half a beat between each so it lands as three separate commitments, not one blur.

---

## Slide 10 — Why This Matters for FY27 (14:30–15:30)

**On slide:** One sentence + one visual (a simple curve): "Partners and integrations scale exponentially. Manual doc effort should not."

X-axis: growth in partners/APIs. Two lines: "engineering support cost (today)" trending up linearly with platform growth, vs. "engineering support cost (with DaaP)" staying flat.

**Say:**
"This is the actual bet: if our open platform is going to grow the way FY27 goals expect, our documentation process cannot grow linearly with it. Docs-as-a-Product is how we decouple 'more partners' from 'more manual support work.'"

---

## Slide 11 — Closing / Call Back (15:30–16:30)

**On slide:** Return to the opening question: "Whose hand went up earlier? This is how we make sure it doesn't happen again." + your contact info / where to find the demo repo.

**Say:**
Close on the emotional hook from slide 2, then explicitly invite people to grab you after or ping you — technical writers rarely get to pitch engineering architecture, so make the ask memorable: "If you want your team's docs to work like this, come find me."

---

## Slide 12 — Thank You / Q&A (16:30–18:00+)

**On slide:** "Thank you" + QR code linking to https://sridhar-techwriter.github.io/docs-as-a-product-spelunking2026/ + your name/contact + "Questions?"

**Say:**
Open the floor. Have 2–3 anticipated Q&A answers ready (see below).

---

## Anticipated Q&A (prep, don't put on slides)

- **"Does this replace technical writers?"** — No: it removes the *typing* and *chasing*, freeing writers to do information architecture, developer UX, and the parts of docs that require judgment — which is a stronger, more strategic role, not a smaller one.
- **"What about narrative/conceptual docs, not just API reference?"** — DaaP covers the reference layer end-to-end; conceptual guides still need human authorship, but they're now decoupled from reference churn, so writers spend time there instead of on sync work.
- **"What's the cost/effort to set this up?"** — Point to the demo repo: it's a spec file, a config file, and one CI workflow file. The barrier is mindset and DoD, not tooling budget.
- **"How do you handle breaking changes / versioning?"** — Flag it as a natural next step (spec versioning, changelogs generated from diffs) — good to mention briefly if asked, don't proactively over-scope the talk with it.
- **"Okay, but who's making sure the auto-generated docs are actually good — is the writer just cut out of the loop?"** — No: the repo uses a GitHub `CODEOWNERS` rule that maps the OpenAPI spec to the technical writer, so any PR touching it automatically requests the writer as a reviewer (real email/notification, no ticket, no Slack ping) and can be configured to block merging until they approve. Automation doesn't remove the writer — it guarantees they're never *left out*. See [`reviewer-gate-codeowners.md`](reviewer-gate-codeowners.md) if you want to show it live.
