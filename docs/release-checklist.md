# Release checklist — Babel site

Before merging the campaign branch (merge can trigger Vercel production
deployment; merge permission must cover that consequence):

- [ ] `npm ci` in a clean worktree, then `npm run verify` passes.
- [ ] `npm run check:sources` run; snapshot state recorded in the handoff.
- [ ] Exact-head review recorded (base SHA, head SHA, reviewer or honest self-review).
- [ ] Screenshots reviewed at 360×800, 390×844, 768×1024, 1440×900.
- [ ] Lighthouse medians (3 runs, home + quickstart) recorded against targets.
- [ ] `check-build` budget output recorded; any exception explicitly accepted.
- [ ] No `unsafe-inline`/`unsafe-eval` added; hash file refreshed only via `npm run build`.
- [ ] Banned/private-path checks pass (content-policy tests).
- [ ] Handoff report completed per packet template (03-ACCEPTANCE-AND-HANDOFF).

## Rollback

- The previous production deployment/revision stays available in Vercel;
  revert via normal Git/deployment controls (never force-push, never delete
  the last working build).
- If a hosted regression appears after deploy, redeploy the previous known
  build and open a repair branch.

## Post-deploy (hosted) verification

- Confirm delivered headers (X-Frame-Options, nosniff, Referrer-Policy).
- Confirm search, theme, code copy work under the delivered headers.
- Confirm legacy redirects (/demo → /tour, /index.html → /) with queries.
- Local tests are configuration-design proof; hosted checks are the deployment
  parity gate.
