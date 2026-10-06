import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { validateMediaRecord } from "../src/lib/product-content";

const root = resolve(__dirname, "..");

describe("media registry", () => {
  const mediaPath = resolve(root, "src/data/media.json");
  const entries = JSON.parse(readFileSync(mediaPath, "utf8")) as unknown[];

  it("is a JSON array", () => {
    expect(Array.isArray(entries)).toBe(true);
  });

  for (const [i, entry] of entries.entries()) {
    it(`record ${i} validates`, () => {
      const record = validateMediaRecord(entry);
      // Reference media must stay labeled as such in its alt text.
      if (record.kind === "reference_ui") {
        expect(record.altText).toMatch(/reference|illustrative|preview/i);
      }
    });

    it(`record ${i} references an existing asset with a matching digest`, () => {
      const record = validateMediaRecord(entry);
      const asset = resolve(root, "public", record.file.replace(/^\//, ""));
      expect(existsSync(asset), `missing asset ${record.file}`).toBe(true);
      const digest = createHash("sha256")
        .update(readFileSync(asset))
        .digest("hex");
      expect(record.digest).toBe(`sha256-${digest}`);
    });
  }

  it("media absence is a valid state (reference fallback)", () => {
    expect(entries.length).toBe(0);
  });
});
