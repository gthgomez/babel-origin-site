import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

function listFiles(dir: string, base = ""): string[] {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[];
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

const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));

describe("response headers protect every response", () => {
  it("keeps anti-framing, nosniff, referrer policy on all routes", () => {
    const headers = vercel.headers?.[0]?.headers ?? [];
    const get = (key: string) =>
      headers.find((h: { key: string }) => h.key.toLowerCase() === key.toLowerCase());
    expect(get("X-Frame-Options")?.value).toBe("DENY");
    expect(get("X-Content-Type-Options")?.value).toBe("nosniff");
    expect(get("Referrer-Policy")?.value).toBe("strict-origin-when-cross-origin");
  });

  it("does not repeat a script/style CSP in the response header (meta-only policy)", () => {
    const headers = vercel.headers?.[0]?.headers ?? [];
    expect(headers.find((h: { key: string }) => h.key === "Content-Security-Policy")).toBeUndefined();
  });
});

describe("every emitted HTML page carries a build-generated meta CSP", () => {
  it.skipIf(!existsSync(dist))("meta CSP exists, is strict, and allows no unsafe keywords", () => {
    const htmlFiles = listFiles(dist).filter((f) => f.endsWith(".html"));
    expect(htmlFiles.length).toBeGreaterThan(0);
    for (const file of htmlFiles) {
      const html = readFileSync(resolve(dist, file), "utf8");
      const meta = html.match(
        /<meta http-equiv="content-security-policy" content="([^"]*)">/i
      );
      expect(meta, `${file} missing meta CSP`).not.toBeNull();
      const csp = meta?.[1] ?? "";
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("form-action 'none'");
      expect(csp.toLowerCase()).not.toMatch(/'unsafe-inline'/);
      // 'wasm-unsafe-eval' (Pagefind) is allowed; bare 'unsafe-eval' is not.
      expect(csp.toLowerCase()).toMatch(/'wasm-unsafe-eval'/);
      expect(csp.toLowerCase()).not.toMatch(/'unsafe-eval'/);
      // Inline scripts are hash-allowed, not keyword-allowed.
      expect(csp).toMatch(/script-src[^;]*'sha256-/);
    }
  });

  it.skipIf(!existsSync(dist))("does not emit inline <style> blocks relying on style-src exceptions", () => {
    for (const file of listFiles(dist).filter((f) => f.endsWith(".html"))) {
      const html = readFileSync(resolve(dist, file), "utf8");
      expect(html.match(/<style[^>]*>/), `${file} has inline styles`).toBeNull();
    }
  });
});
