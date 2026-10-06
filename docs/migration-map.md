# Migration map — legacy site → Astro/Starlight product site

Every legacy surface, check, and route and its replacement. Legacy files remain in
Git history; they are deleted from the working tree only after their replacement
coverage exists (T07 cleanup).

## Routes

| Legacy | Replacement | Notes |
| --- | --- | --- |
| `/` (index.html) | `/` (src/pages/index.astro) | Product homepage per spec §6 |
| `/index.html` | → `/` | Redirect in vercel.json |
| `/demo`, `/demo/`, `/demo/index.html` | → `/tour` | Redirects preserve queries; no loops |
| `#proof` homepage anchor | `/` `#proof` section (current-state summary) | Meaningful content retained |
| `#limits` homepage anchor | `/` `#limits` section (maturity note / limitations) | Meaningful content retained |
| 404 (server default) | `/404` page with home/docs/search recovery | New |

Unknown paths are not blanket-redirected to the homepage.

## Build and serving

| Legacy | Replacement |
| --- | --- |
| `scripts/build-public.cjs` (copy into public/) | Astro static build → `dist/` |
| `public/` as output | `public/` = source assets only; `dist/` = generated output |
| `scripts/serve.cjs` (plain http server) | `npm run preview` (Astro preview) |
| `scripts/check-site.cjs` (stale string checks) | `scripts/check-content.ts` + `scripts/check-build.ts` (T03/T07) |
| vercel.json `outputDirectory: public` | `outputDirectory: dist`; redirects/headers preserved |

## Tests

| Legacy | Replacement |
| --- | --- |
| tests/csp.test.js (config assertions) | tests/csp.test.ts (config + browser securitypolicyviolation/console checks) |
| tests/interaction.test.js (demo cards, jsdom) | tests/e2e/product.spec.ts (tour reference UI, built artifact) |
| (none) | tests/product-content.test.ts, tests/content-policy.test.ts, tests/media.test.ts, tests/routes.test.ts, tests/e2e/{navigation,docs,security,accessibility}.spec.ts |

## CI

| Legacy | Replacement |
| --- | --- |
| Build before install | checkout → Node 22 → `npm ci` → check/test → build → artifact/browser checks |
| Stale "no lockfile" comment | npm cache configured from committed lockfile |
| html-validate/lychee on public/ | Applied to dist/ (route/link/anchor validation folded into `npm run check:build`) |

## Content rules

| Legacy rule | Fate |
| --- | --- |
| Required strings: "prompt-stack validation", `doctor --scope all`, `/demo/` | Removed (stale product story) |
| Banned: production-ready/autonomous-agent phrasing | Kept, scoped to rendered public surface |
| Banned: `C:\Workspace`, `Babel-private`, `service-role`, hardening plan refs | Kept (privacy safeguards) |
| Banned: `api[_-]?key` wholesale | Replaced: legitimate credential-setup terminology allowed in docs; detect actual secret-shaped values |
| Proof-card claims (typecheck pass, benchmarks) | Removed; status derives from typed snapshot data with evidence IDs |

## Assets

`assets/babel-terminal-proof.png` is a generic terminal mock. It is not live-run
proof and must not be presented as one; the tour uses an explicitly labeled
reference interface. `assets/site.css`/`site.js` are replaced by the token system
and Astro components after tour behavior parity exists.
