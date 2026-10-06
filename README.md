# Babel — Product Website & Docs

Astro + Starlight static site for Babel Harness: product homepage, task-oriented
documentation, and an honest status/download/changelog surface.

> **Status: proprietary.** This repository is public for source visibility and
> transparency. It is **not open source** — there is no license grant to reuse,
> modify, or redistribute this code. See [LICENSE](LICENSE).

## Architecture

- Marketing pages: `src/pages/` (Astro, static output to `dist/`)
- Documentation: `src/content/docs/` (Starlight, 18 source-linked guides)
- Product claims: `src/data/*.json` validated by `src/lib/product-content.ts`
- Security: build-generated meta CSP with script hashes — see
  [docs/security-decision.md](docs/security-decision.md)

Product source of truth: [gthgomez/Babel](https://github.com/gthgomez/Babel).

## Local use

```powershell
npm ci
npm run verify
```

- `npm run dev` — dev server
- `npm run build` — static production build → `dist/`
- `npm run test:e2e` — Playwright against the built artifact
- `npm run check:sources` — read-only upstream snapshot audit (never in build)

Vercel: framework Other, build `npm run build`, output `dist`, no environment
variables.

## Content rules

All product claims derive from the pinned snapshot in
`src/data/product-status.json`. See
[docs/content-maintenance.md](docs/content-maintenance.md) for the refresh
procedure and [docs/security-decision.md](docs/security-decision.md) for the CSP
design.

## License

Proprietary; see [LICENSE](LICENSE). Babel and third-party materials retain
their own licenses.
