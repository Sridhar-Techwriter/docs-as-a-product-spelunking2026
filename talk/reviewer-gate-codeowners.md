# Bonus Beat: The Writer as a Required Reviewer (CODEOWNERS)

This is a second optional "bonus" demo beat — same category as
[`wow-moment-auto-draft.md`](wow-moment-auto-draft.md). Don't put it in the
timed 4-minute script; pull it out if someone in Q&A asks "okay, but how
does the writer even *find out* a change happened?"

## The idea

> "Once the code is ready — say the PM/engineer adds a new endpoint — the
> technical writer should get an email that it's ready to review, so the
> writer can review and then push it."

That's exactly what GitHub's built-in **CODEOWNERS** feature does, with
zero custom code, no email server, and no secrets to manage:

1. [`.github/CODEOWNERS`](../.github/CODEOWNERS) maps `demo/openapi/` (the
   API contract) to the technical writer's GitHub handle.
2. Whenever a pull request changes that path, GitHub **automatically
   requests the writer as a reviewer** and sends them a real email/
   notification — no ticket, no Slack ping, no separate tool.
3. If branch protection also requires that review (see setup below), the
   PR's merge button is **blocked** — labeled "Review required from Code
   Owners" — until the writer approves. The writer reviews, then merges
   (or pushes the button that says so).

That's the whole workflow the user described: *engineer adds code → writer
notified automatically → writer reviews → writer merges/pushes* — built
entirely out of a two-line ownership file plus one checkbox in repo
settings.

## One-time setup (do this once, not part of the timed demo)

`CODEOWNERS` alone only auto-requests a reviewer — it doesn't block
merging by itself. To get the full "gate," turn on one branch protection
setting on the **github.com mirror** (the repo with the live Pages site):

1. Go to the repo → **Settings → Branches**.
2. Under **Branch protection rules**, add/edit a rule for `main`.
3. Check **Require a pull request before merging**.
4. Under that, check **Require review from Code Owners**.
5. Save.

I can't flip this checkbox for you — it needs your GitHub.com login and
there's no `gh` CLI / API token available in this environment. It's a
30-second, one-time click, and after that it's permanent for every future
PR.

## How to show it live (if you do pull this into Q&A)

1. Open (or already have open) a pull request that touches
   `demo/openapi/orbit-platform-api.yaml` — e.g. the branch you use for the
   main live-typing demo works perfectly, since it edits that exact file.
2. Point at the **Reviewers** panel on the right side of the PR: the
   technical writer is listed there automatically, with a small "owner"
   badge — nobody typed `@` and requested them.
3. Point at the merge box at the bottom: if branch protection is on, it
   shows **"Review required from Code Owners"** in red/yellow and disables
   the merge button until that review is submitted.
4. Say: *"I didn't build a notification system. I wrote a two-line file
   once. GitHub does the paging, the email, and the merge gate for free —
   because the writer is a first-class reviewer on the API contract, not
   an afterthought."*

**Honesty note for solo-account rehearsals:** GitHub does not auto-request
a review from the same account that authored the PR (you can't be asked to
review your own work). If you're demoing this solo, narrate it as "in
practice, this is opened by an engineer's account, not mine" rather than
expecting to see yourself auto-added as a reviewer on your own PR. The
merge-block banner, however, still shows correctly regardless of who
authored the PR, so that part is safe to demo live even solo.

## Why this is worth mentioning even though it's not "the wow moment"

The main demo answers *"can docs update automatically?"* This answers the
question that's almost always asked right after: *"but who's making sure
the docs are actually good, not just auto-generated garbage?"* CODEOWNERS
is the one-sentence answer: automation doesn't remove the writer from the
loop — it guarantees they're never *left out* of it.
