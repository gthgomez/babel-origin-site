// Built-artifact validation: required routes, meta CSP, internal links and
// anchors, publication allowlist, and transfer budgets. Run after build.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
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

let failed = false;
const fail = (msg: string) => {
  console.error(msg);
  failed = true;
};

if (!existsSync(dist)) {
  console.error("dist/ missing — run `npm run build` first.");
  process.exit(1);
}

const files = listFiles(dist);
const htmlFiles = files.filter((f) => f.endsWith(".html"));

// Required routes
const requiredRoutes = [
  "index.html",
  "404.html",
  "tour/index.html",
  "download/index.html",
  "status/index.html",
  "changelog/index.html",
  "security/index.html",
  "docs/index.html",
  "docs/getting-started/install/index.html",
  "docs/getting-started/quickstart/index.html",
  "docs/getting-started/first-coding-task/index.html",
  "docs/getting-started/troubleshooting/index.html",
  "docs/using-babel/chat/index.html",
  "docs/using-babel/plan/index.html",
  "docs/using-babel/deep/index.html",
  "docs/using-babel/sessions-and-recovery/index.html",
  "docs/interfaces/overview/index.html",
  "docs/interfaces/desktop/index.html",
  "docs/configuration/models-and-providers/index.html",
  "docs/safety/permissions/index.html",
  "docs/safety/execution-profiles/index.html",
  "docs/verification/overview/index.html",
  "docs/customization/project-instructions/index.html",
  "docs/reference/cli/index.html",
  "docs/architecture/overview/index.html",
];
const missing = requiredRoutes.filter((r) => !files.includes(r));
if (missing.length) fail(`Missing required routes: ${missing.join(", ")}`);

// Meta CSP on every page
for (const file of htmlFiles) {
  const html = readFileSync(resolve(dist, file), "utf8");
  if (!/http-equiv="content-security-policy"/i.test(html)) fail(`${file}: missing meta CSP`);
}

// Publication allowlist: no private artifacts ship.
for (const file of files) {
  if (/credential|secret|\.env$|HARDENING_PLAN|hardening|\.aic/i.test(file)) {
    fail(`${file}: private-looking file in dist/`);
  }
}

// Internal links and anchors across all HTML pages.
const targets = new Set<string>(["/"]);
for (const f of htmlFiles) {
  if (f === "index.html") continue;
  if (f === "404.html") continue;
  targets.add("/" + f.replace(/index\.html$/, "").replace(/\/$/, ""));
}
const anchorSets = new Map<string, Set<string>>();
for (const f of htmlFiles) {
  const html = readFileSync(resolve(dist, f), "utf8");
  const ids = new Set<string>();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
  anchorSets.set("/" + f.replace(/index\.html$/, "").replace(/\/$/, ""), ids);
}
for (const f of htmlFiles) {
  const html = readFileSync(resolve(dist, f), "utf8");
  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|javascript:|#)/.test(href)) continue;
    const [path, anchor] = href.split("#");
    const normalized = ("/" + path.replace(/\.html$/, "").replace(/\/$/, "")).replace("//", "/");
    if (path.endsWith(".html")) {
      // Legacy-style .html internal links should only be the canonical / redirect.
      if (normalized !== "/") fail(`${f}: internal .html link ${href} (use clean URL)`);
      continue;
    }
    if (!targets.has(normalized)) {
      // Any real file on disk (assets, sitemap, robots) is a valid target;
      // otherwise this is a broken internal link.
      if (existsSync(resolve(dist, "." + path))) continue;
      fail(`${f}: broken internal link ${href}`);
      continue;
    }
    if (anchor && targets.has(normalized)) {
      const ids = anchorSets.get(normalized);
      if (ids && !ids.has(anchor)) fail(`${f}: missing anchor #${anchor} on ${normalized}`);
    }
  }
}

// Transfer budgets (gzip, per spec §10).
// Per-page CSS budget ≤ 100 KiB gzip.
for (const file of files.filter((f) => f.endsWith(".css"))) {
  const gz = gzipSync(readFileSync(resolve(dist, file))).length;
  if (gz > 100 * 1024) fail(`${file}: CSS gzip ${gz} exceeds 100 KiB budget`);
}
// Homepage initial first-party JS ≤ 50 KiB gzip (all /_astro JS referenced by index.html).
{
  const html = readFileSync(resolve(dist, "index.html"), "utf8");
  const scripts = [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]);
  let total = 0;
  for (const s of new Set(scripts)) {
    const p = resolve(dist, "." + s);
    if (existsSync(p)) total += gzipSync(readFileSync(p)).length;
  }
  console.log(`homepage initial JS: ${(total / 1024).toFixed(1)} KiB gzip (budget 50 KiB)`);
  if (total > 50 * 1024) fail(`homepage initial JS ${total} exceeds 50 KiB budget`);
}

if (failed) process.exit(1);
console.log(
  `check-build OK (${files.length} files, ${htmlFiles.length} pages, routes/links/anchors/budgets validated)`
);
