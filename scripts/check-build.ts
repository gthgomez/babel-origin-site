// T02 minimal artifact validation; expanded in T07 (links, anchors, budgets).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname ?? process.cwd(), "..");
const dist = resolve(root, "dist");

function listFiles(dir: string, base = ""): string[] {
  const out: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...listFiles(resolve(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

if (!existsSync(dist)) {
  console.error("dist/ missing — run `npm run build` first.");
  process.exit(1);
}

const files = listFiles(dist);
const requiredRoutes = ["index.html", "docs/index.html", "tour/index.html"];
const missing = requiredRoutes.filter((r) => !files.includes(r));
if (missing.length) {
  console.error(`Missing required routes: ${missing.join(", ")}`);
  process.exit(1);
}

for (const file of files.filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(resolve(dist, file), "utf8");
  if (!/http-equiv="content-security-policy"/i.test(html)) {
    console.error(`${file}: missing meta CSP`);
    process.exit(1);
  }
}

// No private artifacts may ship.
for (const file of files) {
  if (/credential|secret|\.env$|HARDENING_PLAN|hardening|\.aic/i.test(file)) {
    console.error(`${file}: private-looking file in dist/`);
    process.exit(1);
  }
}

console.log(`check-build OK (${files.length} files, ${files.filter((f) => f.endsWith(".html")).length} pages)`);
