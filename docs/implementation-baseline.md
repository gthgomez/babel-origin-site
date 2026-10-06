# Implementation baseline — Babel product site campaign

Campaign branch: `feat/babel-product-site-docs`
Packet: Babel_Site_Agent_Packet (2026-10-06). Spec and plan are retained under
`docs/superpowers/` for review; they are not published web content.

## Revisions

| Item | Value |
| --- | --- |
| Site base SHA (main) | `d60c17eb816786a712fef5fda7af6a93b1331a0e` |
| Site base HEAD verified | Yes — clean clone; matches packet snapshot exactly |
| Babel main SHA (product source of truth) | `cf17c00da3c51678fd010ed645224686dcea94b0` |
| Babel reference clone | Local read-only clone of `github.com/gthgomez/Babel` |
| Babel PR #308 (installer lifecycle) | Observed 2026-10-06 as OPEN, DRAFT, not merged. Not release evidence. |
| Babel PR #309 (chat reliability) | Observed 2026-10-06 as OPEN, not merged, based on a campaign branch. Not release evidence. |
| Site open PRs at baseline | None (all three historical PRs merged) |
| Snapshot review date | 2026-10-06 |

## Observed baseline checks (before any change)

| Command | Environment | Result |
| --- | --- | --- |
| `npm install` | Windows, Node v24.12.0, npm via Git Bash | exit 0 |
| `npm test` | Vitest 5 | 11/11 pass (csp.test.js: 3, interaction.test.js: 8) |
| `npm run build` (check + build-public) | Node v24.12.0 | exit 0, wrote `public/` |

CI runs on Node 22 (`actions/setup-node` `node-version: "22"`); local Node 24.12.0
satisfies the selected toolchain requirement (Node >= 22.12.0).

## Inherited defects confirmed (not introduced by this campaign)

1. **CI order** — `.github/workflows/ci.yml` runs `npm run build` *before*
   `npm install`, and retains a stale comment claiming the repo has no lockfile
   while `package-lock.json` is committed. Fixed in T02.
2. **Output directory** — `vercel.json` `outputDirectory: public`; the build script
   copies hand-authored files into `public/`. Migrating to Astro output `dist/`.
3. **Stale content checker** — `scripts/check-site.cjs` *requires* obsolete copy
   ("prompt-stack validation", `doctor --scope all`, `/demo/` links) and bans the
   phrase `api[_-]?key` wholesale. Its privacy protections (no `Babel-private`,
   no `C:\Workspace`, no service-role strings) must survive into the replacement.
4. **Positioning** — the current site describes Babel as an "experimental prompt-stack
   validation CLI prototype", contradicting the product's actual Chat/Plan/Deep
   coding-agent shape.
5. **dev_local documentation contradiction** — see `docs/upstream-followups.md`.

## Toolchain selection (T01 decision)

Resolved from the npm registry on 2026-10-06:

| Package | Version | Rationale |
| --- | --- | --- |
| astro | 7.3.6 | Current stable; static output; Node >= 22.12.0 |
| @astrojs/starlight | 0.42.5 | Current stable; peer astro ^7.2.10 |
| Node (local + CI) | >= 22.12 | Satisfies Astro 7 engines; CI already pins 22 |

Search: Starlight's built-in Pagefind integration (no hosted service). Tests: keep
Vitest; add Playwright for built-artifact browser tests. npm + committed lockfile
retained. Exact versions are recorded in `package.json` / `package-lock.json` at T02.

## Legacy behaviors that must survive migration

- `/index.html` → `/`; `/demo`, `/demo/`, `/demo/index.html` → `/tour` (queries preserved).
- Homepage `#proof` and `#limits` anchors keep meaningful content.
- Security headers: CSP (self, no blanket unsafe-inline/eval), Referrer-Policy
  `strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`. Anti-framing, no forms, no secrets, same-origin resources.
- Privacy content rules: no internal plan names, no private repo references, no local
  machine paths, no credential values in emitted output.
- Proprietary licensing boundary (LICENSE, README banner, SECURITY.md posture).
- Vercel project/hostname unchanged.

## Existing test coverage inventory

- `tests/csp.test.js` — asserts vercel.json header configuration (configuration-level,
  not browser-level). Replaced by browser-executed CSP checks plus a config test.
- `tests/interaction.test.js` — jsdom coverage of the demo command-card switcher
  (4 lanes: ask/plan/fix/doctor). The interaction pattern (accessible tabbed
  reference UI, active-state management) carries into `/tour`; the stale
  prompt-stack copy does not.

## Remote / authorization state

The workspace trusted-profile registry has `babel.yaml` for `gthgomez/Babel`
(public_canonical) but **no registered profile for `gthgomez/babel-origin-site`**.
Per workspace policy this restricts push/PR/merge for this remote (STOP_REMOTE)
until a profile is registered; local work, commits, builds, and tests are
unrestricted. Registration is handled at T08 before any remote mutation.
