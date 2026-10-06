import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const vercelConfig = JSON.parse(
  readFileSync(resolve(root, "vercel.json"), "utf8")
);

function getHeaders() {
  const route = vercelConfig.headers?.[0];
  if (!route) return [];
  return route.headers ?? [];
}

function getHeader(key) {
  return getHeaders().find(
    (h) => h.key.toLowerCase() === key.toLowerCase()
  );
}

describe("vercel.json security headers", () => {
  it("defines a Content-Security-Policy header", () => {
    const csp = getHeader("Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp.value).toContain("default-src 'self'");
  });

  it("sets X-Frame-Options to DENY", () => {
    const xfo = getHeader("X-Frame-Options");
    expect(xfo).toBeDefined();
    expect(xfo.value).toBe("DENY");
  });

  it("sets X-Content-Type-Options to nosniff", () => {
    const xcto = getHeader("X-Content-Type-Options");
    expect(xcto).toBeDefined();
    expect(xcto.value).toBe("nosniff");
  });
});
