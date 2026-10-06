import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parseProductSnapshot, ProductContentError } from "../src/lib/product-content";

const root = resolve(__dirname, "..");

// Renders the public surface the way a visitor would see it: every page under
// src/pages plus the docs content is checked for banned/stale claims. This
// replaces the legacy check-site.cjs string requirements, keeping the privacy
// rules and dropping the obsolete product story.
function collectFiles(dir: string, exts: string[], base = ""): string[] {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...collectFiles(resolve(dir, e.name), exts, rel));
    else if (exts.some((x) => e.name.endsWith(x))) out.push(resolve(dir, e.name));
  }
  return out;
}

const publicSurface = [
  ...collectFiles(resolve(root, "src/pages"), [".astro"]),
  ...collectFiles(resolve(root, "src/content/docs"), [".md", ".mdx"]),
  ...collectFiles(resolve(root, "src/components"), [".astro"]),
  ...collectFiles(resolve(root, "src/layouts"), [".astro"]),
  ...collectFiles(resolve(root, "src/data"), [".json"]),
];

describe("privacy safeguards on the rendered public surface", () => {
  const banned = [
    [/Babel-private/i, "private repository name"],
    [/C:\\+Workspace/i, "local machine path"],
    [/service-role/i, "backend credential role"],
    [/HARDENING_PLAN/i, "internal planning artifact"],
    [/sk-[A-Za-z0-9_-]{16,}/, "secret-shaped API key value"],
    [/ghp_[A-Za-z0-9]{20,}/, "GitHub token value"],
    [/BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/, "private key material"],
  ];

  for (const file of publicSurface) {
    const text = readFileSync(file, "utf8");
    const rel = file.slice(root.length + 1);
    for (const [pattern, label] of banned) {
      it(`${rel} contains no ${label}`, () => {
        expect(pattern.test(text), `${rel} matches banned pattern ${pattern}`).toBe(false);
      });
    }
  }
});

describe("obsolete product story does not return as current claims", () => {
  // The old positioning strings must not appear outside migration notes.
  const staleClaims: Array<[RegExp, string]> = [
    [/prompt-stack validation CLI prototype/i, "old prototype positioning"],
    [/176 registered/i, "stale catalog count"],
    [/recorded-provider/i, "stale provider story"],
    [/governance-replay/i, "stale governance story"],
  ];

  for (const file of publicSurface) {
    const text = readFileSync(file, "utf8");
    const rel = file.slice(root.length + 1);
    for (const [pattern, label] of staleClaims) {
      it(`${rel} avoids ${label}`, () => {
        expect(pattern.test(text), `${rel} matches stale claim ${pattern}`).toBe(false);
      });
    }
  }

  it("legitimate credential-setup terminology is allowed in docs", () => {
    // e.g. a doc may say "set your API key" — banning the phrase outright was
    // the old checker's flaw. Here we only ban secret-shaped values.
    expect(/sk-[A-Za-z0-9_-]{16,}/.test("set BABEL_API_KEY in .env")).toBe(false);
  });
});

describe("production-readiness language stays bounded", () => {
  for (const file of publicSurface) {
    const text = readFileSync(file, "utf8");
    const rel = file.slice(root.length + 1);
    it(`${rel} does not claim production readiness or autonomy`, () => {
      expect(/production-ready (agent|system)|autonomous agent/i.test(text)).toBe(false);
    });
  }
});

describe("snapshot data stays internally consistent", () => {
  it("committed product-status.json parses", () => {
    const data = JSON.parse(
      readFileSync(resolve(root, "src/data/product-status.json"), "utf8")
    );
    expect(() => parseProductSnapshot(data)).not.toThrow();
  });

  it("a tampered snapshot with a fake download readiness is rejected", () => {
    const data = JSON.parse(
      readFileSync(resolve(root, "src/data/product-status.json"), "utf8")
    );
    data.distributions = data.distributions.map((d: Record<string, unknown>) =>
      d.kind === "npm" ? { ...d, availability: "available" } : d
    );
    expect(() => parseProductSnapshot(data)).toThrow(ProductContentError);
  });
});
