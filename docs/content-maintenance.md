# Content maintenance — Babel site

## The pinned snapshot model

All product claims on this site derive from `src/data/product-status.json`,
which pins one Babel revision and one human review date
(`reviewedAt`). Guides additionally pin `sourceRevision` in their frontmatter.

- A build never updates `reviewedAt` or the pinned revision automatically.
- Updating the snapshot is a **reviewed content change**, not a feed refresh.

## What invalidates what

| Upstream change | Affected content |
| --- | --- |
| New release with public assets | `distributions[]`, `/download`, `/changelog`; `getInstallActions` may gain a download CTA only when asset + checksum + revision + signing state are present |
| Merge of installer lifecycle qualification (PR #308 or successor) | Desktop/distribution records; `/status` qualification columns |
| Merge of chat-reliability work (PR #309 or successor) | `coding-loop-reliability` qualification; tour/verification prose only if behavior contracts change |
| Changes to `executionProfiles.ts` | `/docs/safety/execution-profiles`, troubleshooting, install guides |
| Changes to CLI commands/help | `/docs/reference/cli`, quickstart |
| Docs-only contradictions fixed upstream | `docs/upstream-followups.md` entries can be removed |

## Refresh procedure

1. Run `npm run check:sources` — read-only; classifies "upstream moved" vs
   "pinned snapshot invalid". A moving main never silently becomes site truth.
2. Diff the upstream range (the command prints it).
3. Decide which claims change; update `src/data/product-status.json`
   (new `sourceRevision` + new `reviewedAt`) and the affected guides' frontmatter.
4. Run `npm run check && npm test && npm run build && npm run check:build`.
5. Record the refresh in `docs/upstream-followups.md` or the PR description.

## Rules that do not change

- Availability ≠ qualification. Source presence is not a workflow score.
- An unmerged PR is never release evidence.
- No invented install commands, downloads, benchmarks, or captures.
- `media.json` stays empty until an asset with real provenance and digest exists.
