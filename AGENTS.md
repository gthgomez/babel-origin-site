# AGENTS.md — babel-origin-site

Site-local contributor policy for the Babel product website and documentation
repository. This is a small static site; do not import the Babel runtime's full
contributor policy.

## What this repository is

- An Astro + Starlight static site: marketing pages, task-oriented docs
  (`src/content/docs/`, slugs begin `docs/`), and typed product data
  (`src/data/*.json`, `src/lib/product-content.ts`).
- Proprietary (see LICENSE). Public visibility is not a license grant.
- Deployed to the existing Vercel project/hostname; no other domain is approved.

## Truth rules

- Babel (`gthgomez/Babel`) is the product source of truth. Web guides summarize;
  each page carries source paths and a pinned revision.
- Availability and qualification are separate. Source presence ≠ tested workflow ≠
  published distribution. An unmerged PR is never release evidence.
- No invented install commands, downloads, benchmarks, testimonials, or live
  captures. The tour is an explicitly labeled reference interface unless real
  media exists in `src/data/media.json`.
- Normal builds read committed content only: no GitHub/provider/model requests,
  no secrets, no telemetry.

## Commands

- `npm run dev` — dev server
- `npm run check` — astro/ts check + content validation
- `npm test` — deterministic unit tests
- `npm run build` — static production build → `dist/`
- `npm run preview` — serve built site
- `npm run check:build` — validate emitted routes/links/budgets
- `npm run test:e2e` — Playwright against the built artifact
- `npm run verify` — full sequence

## Boundaries

- Do not weaken CSP, security headers, or content checks to make a build pass.
- `public/` is source assets; never put generated output there.
- No vendor-specific instruction files, no nested instruction authorities.
- Do not rename Babel packages, binaries, repos, or the Desktop application.
- Security posture: see SECURITY.md; no forms, no secrets, same-origin resources.
