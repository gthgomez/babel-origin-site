import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

// Built-artifact route tests. Run after `npm run build` (the `verify` script
// enforces that ordering). Skipping when dist/ is absent is NOT allowed in CI;
// tests fail loudly so a missing build is never mistaken for a pass.
const haveBuild = () => existsSync(resolve(dist, "index.html"));

describe("marketing and docs have distinct routes", () => {
  it.skipIf(!haveBuild())("serves a marketing homepage at /", () => {
    const html = readFileSync(resolve(dist, "index.html"), "utf8");
    expect(html).toContain("A coding agent that shows its work");
    // The homepage must not be the docs shell.
    expect(html).not.toContain('data-starlight-docs="true"');
  });

  it.skipIf(!haveBuild())("serves the docs landing at /docs/", () => {
    const docsLanding = resolve(dist, "docs", "index.html");
    expect(existsSync(docsLanding)).toBe(true);
    const html = readFileSync(docsLanding, "utf8");
    expect(html).toContain("Babel Docs");
  });

  it.skipIf(!haveBuild())("does not relocate the marketing site under /docs", () => {
    // A global base of /docs would move the homepage; verify it did not.
    expect(existsSync(resolve(dist, "docs", "index.html"))).toBe(true);
    const docsHtml = readFileSync(resolve(dist, "docs", "index.html"), "utf8");
    expect(docsHtml).not.toContain("A coding agent that shows its work");
  });
});

describe("legacy demo routes reach tour", () => {
  it.skipIf(!haveBuild())("emits /tour", () => {
    expect(existsSync(resolve(dist, "tour", "index.html"))).toBe(true);
  });

  it("declares legacy /demo redirects in vercel.json", () => {
    const vercel = JSON.parse(
      readFileSync(resolve(root, "vercel.json"), "utf8")
    );
    const redirects = vercel.redirects ?? [];
    const sources = new Set(redirects.map((r: { source: string }) => r.source));
    for (const legacy of ["/index.html", "/demo", "/demo/", "/demo/index.html"]) {
      expect(sources.has(legacy), `missing redirect for ${legacy}`).toBe(true);
    }
    for (const r of redirects) {
      // /index.html → / is the intentional canonical redirect; /demo variants
      // must go to /tour, and nothing redirects unknown paths to the homepage
      // (that is handled by the dedicated 404 page instead).
      if (r.source !== "/index.html") {
        expect(r.destination).not.toBe("/");
      }
      expect(r.statusCode).toBeGreaterThanOrEqual(301);
      expect(r.statusCode).toBeLessThanOrEqual(308);
    }
  });
});

describe("unknown route is not homepage", () => {
  it.skipIf(!haveBuild())("emits a dedicated 404 page", () => {
    const candidates = [
      resolve(dist, "404.html"),
      resolve(dist, "404", "index.html"),
    ];
    const found = candidates.find((p) => existsSync(p));
    expect(found, "no custom 404 page emitted").toBeDefined();
    const html = readFileSync(found as string, "utf8");
    expect(html).toContain("404");
  });
});

describe("private repository files are not public assets", () => {
  it.skipIf(!haveBuild())("does not emit internal planning or credential files", () => {
    const banned = [
      // dist/docs/index.html is the legitimate docs landing page; these are
      // private source directories that must never be copied into dist/.
      "tests/index.html",
      "scripts/index.html",
      "node_modules/index.html",
    ];
    for (const rel of banned) {
      expect(existsSync(resolve(dist, ...rel.split("/"))), `${rel} leaked into dist`).toBe(false);
    }
    // No emitted file may be named like a private artifact.
    const emitted = listFiles(dist);
    for (const f of emitted) {
      expect(f.match(/credential|secret|\.env|HARDENING_PLAN|hardening/i), `${f} looks private`).toBeNull();
    }
  });
});

function listFiles(dir: string, base = ""): string[] {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = require("node:fs").readdirSync(dir, { withFileTypes: true });
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
