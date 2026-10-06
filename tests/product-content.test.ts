import { describe, it, expect } from "vitest";
import {
  parseProductSnapshot,
  getInstallActions,
  getFeatureSummary,
  ProductContentError,
  type ProductSnapshot,
} from "../src/lib/product-content";
import snapshot from "../src/data/product-status.json";
import changelog from "../src/data/changelog.json";
import { parseChangelogForTest } from "./helpers";

const TODAY = "2026-10-06";

const baseFeature = {
  id: "chat",
  label: "Chat",
  availability: "source_only",
  qualification: "source_inspected",
  scope: "Chat entrypoint present in source.",
  limitations: [],
  evidenceIds: ["e1"],
};

const baseSnapshot = (): Record<string, unknown> => ({
  schemaVersion: 1,
  repository: "https://github.com/gthgomez/Babel",
  sourceRevision: "cf17c00da3c51678fd010ed645224686dcea94b0",
  reviewedAt: "2026-10-06",
  features: [baseFeature],
  distributions: [
    {
      id: "source",
      kind: "source",
      label: "Source checkout",
      availability: "available",
      revision: "cf17c00da3c51678fd010ed645224686dcea94b0",
      signingState: "not_applicable",
      evidenceIds: ["e1"],
    },
  ],
  evidence: [
    {
      id: "e1",
      kind: "source",
      url: "https://github.com/gthgomez/Babel/blob/cf17c00da3c51678fd010ed645224686dcea94b0/README.md",
      revision: "cf17c00da3c51678fd010ed645224686dcea94b0",
      observationDate: "2026-10-06",
      supports: "Documented install path.",
    },
  ],
});

describe("parseProductSnapshot (seeded data)", () => {
  it("accepts the committed product snapshot", () => {
    const parsed = parseProductSnapshot(snapshot, { today: TODAY });
    expect(parsed.features.length).toBeGreaterThan(0);
    expect(parsed.distributions.find((d) => d.kind === "npm")?.availability).toBe(
      "not_available"
    );
  });

  it("accepts the committed changelog entries", () => {
    expect(() => parseChangelogForTest(changelog)).not.toThrow();
  });
});

describe("source presence does not enable binary download", () => {
  it("a source-only feature never produces a download action", () => {
    const parsed = parseProductSnapshot(baseSnapshot(), { today: TODAY });
    const actions = getInstallActions(parsed);
    expect(actions.every((a) => a.kind === "source")).toBe(true);
  });

  it("an available binary without asset/checksum is rejected", () => {
    const snap = baseSnapshot();
    (snap.distributions as unknown[]).push({
      id: "zip",
      kind: "portable",
      label: "Windows portable",
      availability: "available",
      signingState: "unsigned",
      evidenceIds: ["e1"],
    });
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(ProductContentError);
  });

  it("getInstallActions turns an unqualified binary into an explanatory non-link", () => {
    const snap = baseSnapshot();
    (snap.distributions as unknown[]).push({
      id: "zip",
      kind: "portable",
      label: "Windows portable",
      availability: "not_available",
      reason: "Not published.",
      signingState: "unsigned",
      evidenceIds: ["e1"],
    });
    const parsed = parseProductSnapshot(snap, { today: TODAY });
    const zip = getInstallActions(parsed).find((a) => a.label === "Windows portable");
    expect(zip?.href).toBe("/status/");
    expect(zip?.notice).toBe("Not published.");
  });
});

describe("unmerged PR is not a release", () => {
  it("rejects evidence claiming release support from an open PR", () => {
    const snap = baseSnapshot();
    (snap.evidence as unknown[]).push({
      id: "pr",
      kind: "pull_request",
      url: "https://github.com/gthgomez/Babel/pull/308",
      observationDate: "2026-10-06",
      observedState: "open",
      supports: "The installer is released and generally available.",
    });
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/unmerged PR/);
  });

  it("a changelog development entry cannot claim release wording", () => {
    expect(() =>
      parseChangelogForTest([
        {
          date: "2026-10-06",
          category: "development",
          title: "Installer released",
          summary: "x",
          sourceUrl: "https://github.com/gthgomez/Babel/pull/308",
        },
      ])
    ).toThrow(/development milestone/);
  });
});

describe("missing evidence is not verified", () => {
  it("a feature referencing unknown evidence fails", () => {
    const snap = baseSnapshot();
    (snap.features as unknown[]).push({ ...baseFeature, id: "other", evidenceIds: ["nope"] });
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/unknown evidence/);
  });
});

describe("review date is not build date", () => {
  it("a future review date is rejected with an injected today", () => {
    const snap = baseSnapshot();
    snap.reviewedAt = "2026-10-07";
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/future/);
  });

  it("normal validation is not time-dependent (no today injected)", () => {
    expect(() => parseProductSnapshot(baseSnapshot())).not.toThrow();
  });
});

describe("unknown feature fails explicitly", () => {
  it("getFeatureSummary throws instead of rendering a default success", () => {
    const parsed = parseProductSnapshot(baseSnapshot(), { today: TODAY }) as ProductSnapshot;
    expect(() => getFeatureSummary(parsed, "does-not-exist")).toThrow(/unknown feature id/);
  });

  it("returns the summary for a known feature", () => {
    const parsed = parseProductSnapshot(baseSnapshot(), { today: TODAY });
    const summary = getFeatureSummary(parsed, "chat");
    expect(summary.availability).toBe("source_only");
    expect(summary.qualification).toBe("source_inspected");
  });
});

describe("reference media cannot be live proof", () => {
  it("rejects a real_session record claiming illustrative content", async () => {
    const { validateMediaRecord } = await import("../src/lib/product-content");
    expect(() =>
      validateMediaRecord({
        file: "media/session.webm",
        altText: "Illustrative reference of a chat run",
        kind: "real_session",
        revision: "cf17c00da3c51678fd010ed645224686dcea94b0",
        captureDate: "2026-10-06",
        digest: "sha256-000",
        rights: "Owned capture",
        scope: "Chat run",
      })
    ).toThrow(/real session/);
  });

  it("a real_session requires revision and capture date", async () => {
    const { validateMediaRecord } = await import("../src/lib/product-content");
    expect(() =>
      validateMediaRecord({
        file: "media/session.webm",
        altText: "Recorded chat session",
        kind: "real_session",
        digest: "sha256-000",
        rights: "Owned capture",
        scope: "Chat run",
      })
    ).toThrow(/real_session/);
  });
});
