// Content validation for npm run check: snapshot, changelog, media, and docs
// frontmatter metadata. Runs outside the Astro build; unit tests cover the
// same rules with synthetic fixtures.
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseProductSnapshot,
  parseChangelogEntries,
  validateMediaRecord,
} from "../src/lib/product-content.ts";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
let failed = false;
const fail = (msg: string) => {
  console.error(msg);
  failed = true;
};

// Snapshot
try {
  const snapshot = parseProductSnapshot(
    JSON.parse(readFileSync(join(root, "src/data/product-status.json"), "utf8"))
  );
  console.log(`product-status OK (revision ${snapshot.sourceRevision.slice(0, 12)}, reviewed ${snapshot.reviewedAt})`);
} catch (e) {
  fail(`product-status.json invalid: ${e instanceof Error ? e.message : e}`);
}

// Changelog
try {
  const entries = parseChangelogEntries(
    JSON.parse(readFileSync(join(root, "src/data/changelog.json"), "utf8"))
  );
  console.log(`changelog OK (${entries.length} entries)`);
} catch (e) {
  fail(`changelog.json invalid: ${e instanceof Error ? e.message : e}`);
}

// Media
try {
  const media = JSON.parse(readFileSync(join(root, "src/data/media.json"), "utf8"));
  if (!Array.isArray(media)) throw new Error("media.json must be an array");
  for (const [i, record] of media.entries()) {
    try {
      validateMediaRecord(record);
    } catch (e) {
      fail(`media[${i}] invalid: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`media OK (${media.length} records)`);
} catch (e) {
  fail(`media.json invalid: ${e instanceof Error ? e.message : e}`);
}

// Docs frontmatter: every guide carries source provenance.
const docsDir = join(root, "src/content/docs");
function walk(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(join(dir, e.name), rel));
    else if (/\.mdx?$/.test(e.name)) out.push(rel);
  }
  return out;
}
let docCount = 0;
for (const rel of walk(docsDir)) {
  docCount++;
  const text = readFileSync(join(docsDir, rel), "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail(`docs/${rel}: missing frontmatter`);
    continue;
  }
  for (const field of ["sourceRevision:", "reviewedAt:", "sourcePaths:"]) {
    if (!fm[1].includes(field)) fail(`docs/${rel}: frontmatter missing ${field}`);
  }
  const sha = fm[1].match(/sourceRevision:\s*([0-9a-f]+)/);
  if (!sha || sha[1].length !== 40) fail(`docs/${rel}: sourceRevision must be a full 40-char SHA`);
  // Explicit docs/ slug on every non-index page (index carries slug: docs).
  const slug = fm[1].match(/^slug:\s*(.+)$/m);
  if (!slug) fail(`docs/${rel}: explicit slug required`);
  else if (slug[1].trim() !== "docs" && !slug[1].trim().startsWith("docs/")) {
    fail(`docs/${rel}: slug must begin with docs/ (got ${slug[1].trim()})`);
  }
}
console.log(`docs OK (${docCount} pages checked for source provenance)`);

process.exit(failed ? 1 : 0);
