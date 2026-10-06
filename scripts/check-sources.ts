// Explicit read-only source-refresh audit. Never runs inside build.
// Reports whether site content is current to its disclosed snapshot and which
// upstream changes may need a deliberate, reviewed update.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const snapshot = JSON.parse(
  readFileSync(resolve(root, "src/data/product-status.json"), "utf8")
);

const pinned = snapshot.sourceRevision;
const reviewedAt = snapshot.reviewedAt;

console.log(`Pinned Babel snapshot: ${pinned}`);
console.log(`Snapshot reviewed at:  ${reviewedAt}`);

// Read-only GitHub API check. Network failures are classified, not passed.
async function main() {
  let head: string | null = null;
  try {
    const res = await fetch("https://api.github.com/repos/gthgomez/Babel/commits/main", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "babel-origin-site-check-sources" },
    });
    if (!res.ok) {
      console.log(`NOT RUN: GitHub API returned ${res.status}. Pinned snapshot retained; retry later.`);
      process.exit(0);
    }
    head = (await res.json()).sha;
  } catch (e) {
    console.log(`NOT RUN: GitHub unreachable (${e instanceof Error ? e.message : e}). Pinned snapshot retained.`);
    process.exit(0);
  }

  if (head === pinned) {
    console.log("CURRENT: Babel main matches the pinned snapshot.");
    return;
  }
  console.log(`UPSTREAM MOVED: Babel main is now ${head}.`);
  console.log("This does NOT invalidate the pinned snapshot — it is still the reviewed state.");
  console.log("A deliberate content review is required before updating any claim:");
  console.log("  1. Diff https://github.com/gthgomez/Babel/compare/" + pinned.slice(0, 12) + "..." + head.slice(0, 12));
  console.log("  2. Decide which guides/status claims are affected.");
  console.log("  3. Update src/data/product-status.json (new revision + review date) and affected pages.");
  console.log("  4. Re-run npm run check && npm test.");
  process.exit(0);
}

main();
