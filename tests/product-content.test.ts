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

const TODAY = "2026-10-11";

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
    const parsed = parseProductSnapshot(snapshot, { today: "2026-10-14" });
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
    expect(zip?.warning).toBeNull();
  });
});

describe("available distributions stay honest", () => {
  it("offers a verified installer before source while retaining its unsigned disclosure", () => {
    const snap = baseSnapshot();
    (snap.distributions as unknown[]).push({
      id: "desktop-windows-setup", kind: "installer", label: "Windows Setup.exe installer",
      availability: "available", version: "v0.1.2", revision: "cf17c00da3c51678fd010ed645224686dcea94b0",
      assetUrl: "https://github.com/gthgomez/Babel/releases/download/v0.1.2/Babel-Desktop-Setup-0.1.2-win-x64.exe",
      checksum: "sha256:" + "a".repeat(64), signingState: "unsigned", evidenceIds: ["e1"],
    });
    const actions = getInstallActions(parseProductSnapshot(snap, {today: TODAY}));
    expect(actions[0]?.label).toBe("Windows Setup.exe installer");
    expect(actions[0]?.notice).toBeNull();
    expect(actions[0]?.warning).toMatch(/unsigned/);
    expect(actions.some(action => action.kind === "source")).toBe(true);
  });
  const validPortable = (): Record<string, unknown> => ({
    id: "zip",
    kind: "portable",
    label: "Windows portable",
    availability: "available",
    version: "v0.1.1",
    assetUrl:
      "https://github.com/gthgomez/Babel/releases/download/v0.1.1/Babel-Desktop-0.1.1-win-x64.zip",
    checksum: "sha256:" + "a".repeat(64),
    signingState: "unsigned",
    evidenceIds: ["e1"],
  });

  it("an available unsigned distribution is a real download with an unsigned warning", () => {
    const snap = baseSnapshot();
    (snap.distributions as unknown[]).push(validPortable());
    const parsed = parseProductSnapshot(snap, { today: TODAY });
    const action = getInstallActions(parsed).find((a) => a.label === "Windows portable");
    // Regression: an unsigned-but-real asset must NOT be filtered out of the
    // rendered links; it carries a warning instead of losing its button.
    expect(action?.kind).toBe("download");
    expect(action?.notice).toBeNull();
    expect(action?.href).toBe(validPortable().assetUrl);
    expect(action?.warning).toMatch(/unsigned/i);
  });

  it("an available signed distribution renders with no signing warning", () => {
    const snap = baseSnapshot();
    (snap.distributions as unknown[]).push({ ...validPortable(), signingState: "signed" });
    const parsed = parseProductSnapshot(snap, { today: TODAY });
    const action = getInstallActions(parsed).find((a) => a.label === "Windows portable");
    expect(action?.notice).toBeNull();
    expect(action?.href).toBe(validPortable().assetUrl);
    expect(action?.warning).toBeNull();
  });

  it("an available download with unknown signing state is rejected", () => {
    const snap = baseSnapshot();
    (snap.distributions as unknown[]).push({ ...validPortable(), signingState: "unknown" });
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/signing state/);
  });

  it("an available download without a checksum is rejected", () => {
    const snap = baseSnapshot();
    const dist = validPortable();
    delete dist.checksum;
    (snap.distributions as unknown[]).push(dist);
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/checksum/);
  });

  it("an available download with a malformed checksum is rejected", () => {
    const snap = baseSnapshot();
    const dist = validPortable();
    dist.checksum = "sha256:deadbeef";
    (snap.distributions as unknown[]).push(dist);
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/sha256/);
  });

  it("an available download without a public asset URL is rejected", () => {
    const snap = baseSnapshot();
    const dist = validPortable();
    delete dist.assetUrl;
    (snap.distributions as unknown[]).push(dist);
    expect(() => parseProductSnapshot(snap, { today: TODAY })).toThrow(/assetUrl/);
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
    snap.reviewedAt = "2026-10-12";
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
