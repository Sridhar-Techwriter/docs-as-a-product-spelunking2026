# Docs-as-a-Product — Spelunking 2026

Talk materials and working demo for **"Docs-as-a-Product: Engineering a
Self-Service Developer Experience for Workday's Open Platform"**, selected
for Spelunking 2026, Track 3 (Open Technology Platform).

## What's in here

```
.
├── talk/
│   ├── abstract.md        # the paper you submitted, kept as the source of truth
│   ├── outline.md         # full slide-by-slide outline with speaker notes + timing
│   └── demo-script.md     # exact live-demo runbook, including a fallback plan
├── demo/
│   ├── openapi/
│   │   └── orbit-platform-api.yaml   # fictional "Orbit" Open Platform API spec
│   ├── redocly.yaml       # Redocly CLI config (lint rules + docs theme)
│   └── package.json       # lint / preview / build scripts
└── .github/workflows/
    └── publish-docs.yml   # CI/CD pipeline: lint -> build docs -> deploy to GitHub Pages
```

This repo *is* the proof of concept for the talk: a fictional OpenAPI spec
("Orbit," standing in for a Workday Open Platform API) that automatically
becomes a published developer docs site whenever the spec changes — no
manual doc editing, ever.

## Quick start

```bash
cd demo
npm install
npm run lint          # validate the OpenAPI spec
npm run docs:preview  # local live-reloading docs preview (used for the live demo)
npm run docs:build    # produce a static HTML docs site in demo/dist/
```

## How the pipeline works

1. An engineer changes `demo/openapi/orbit-platform-api.yaml` (the single
   source of truth for the API's shape and behavior).
2. On push/PR to `main`, [`.github/workflows/publish-docs.yml`](.github/workflows/publish-docs.yml) automatically:
   - Lints the spec with Redocly CLI.
   - Builds a static Redoc documentation site from it.
   - Deploys the site to GitHub Pages.
3. Partners and internal developers always see docs that match the current
   API — because the docs are *generated from* the API, not maintained
   alongside it.

To enable live deployment for your own fork/repo: in **Settings → Pages**,
set the source to **GitHub Actions**. No further config is needed — the
workflow handles the rest.

## Using this for the talk

Start with [`talk/outline.md`](talk/outline.md) for the full slide deck
content and pacing, then rehearse the live segment using
[`talk/demo-script.md`](talk/demo-script.md). The abstract in
[`talk/abstract.md`](talk/abstract.md) is kept verbatim from the submission
so slide language can stay consistent with what reviewers already read.

> All company names, partner names, and API details in this repo are
> fictional and built solely for this conference demo.
