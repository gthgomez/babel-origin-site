/**
 * Typed product snapshot: the single trusted content model consumed by the
 * homepage, /status, /download, and /changelog displays.
 *
 * These are SITE content states, not Babel runtime enums. Structural validation
 * here does not verify semantic truth about Babel; that remains a reviewed
 * content-update task (see docs/content-maintenance.md).
 */

export const AVAILABILITY_VALUES = [
  "source_only",
  "preview_available",
  "released",
  "planned",
  "unknown",
] as const;
export type Availability = (typeof AVAILABILITY_VALUES)[number];

export const QUALIFICATION_VALUES = [
  "source_inspected",
  "scoped_checks",
  "live_workflow",
  "not_qualified",
  "unknown",
] as const;
export type Qualification = (typeof QUALIFICATION_VALUES)[number];

export const DISTRIBUTION_AVAILABILITY_VALUES = [
  "available",
  "not_available",
  "unknown",
] as const;
export type DistributionAvailability = (typeof DISTRIBUTION_AVAILABILITY_VALUES)[number];

export interface FeatureRecord {
  id: string;
  label: string;
  availability: Availability;
  qualification: Qualification;
  /** Narrow statement of what the record covers. */
  scope: string;
  limitations: string[];
  evidenceIds: string[];
}

export type EvidenceKind =
  | "source"
  | "pull_request"
  | "check_run"
  | "release"
  | "capture";

export interface EvidenceRecord {
  id: string;
  kind: EvidenceKind;
  url: string;
  /** Full 40-char git revision where applicable. */
  revision?: string;
  observationDate: string;
  /** What this evidence actually supports. */
  supports: string;
  /** For pull_request records: observed state at observationDate. */
  observedState?: "open" | "draft" | "merged" | "closed";
}

export interface DistributionRecord {
  id: string;
  kind: "source" | "portable" | "installer" | "npm";
  label: string;
  availability: DistributionAvailability;
  version?: string;
  revision?: string;
  assetUrl?: string;
  checksum?: string;
  signingState: "signed" | "unsigned" | "not_applicable" | "unknown";
  /** Shown when the distribution is not available; required if not available. */
  reason?: string;
  evidenceIds: string[];
}

export interface ChangelogEntry {
  date: string;
  category: "release" | "development";
  title: string;
  summary: string;
  revision?: string;
  sourceUrl: string;
}

export interface MediaRecord {
  file: string;
  altText: string;
  kind: "reference_ui" | "real_session";
  revision?: string;
  captureDate?: string;
  digest: string;
  rights: string;
  /** What the asset actually shows — must not overstate. */
  scope: string;
}

export interface ProductSnapshot {
  schemaVersion: 1;
  repository: string;
  /** Full 40-char git revision of the pinned Babel snapshot. */
  sourceRevision: string;
  /** ISO date the snapshot was reviewed. Never set to the build date. */
  reviewedAt: string;
  features: FeatureRecord[];
  distributions: DistributionRecord[];
  evidence: EvidenceRecord[];
}

export interface InstallAction {
  label: string;
  href: string;
  kind: "source" | "download";
  notice: string | null;
}

export interface FeatureSummary {
  id: string;
  label: string;
  availability: Availability;
  qualification: Qualification;
  scope: string;
  limitations: string[];
}

export class ProductContentError extends Error {}

// ---------------------------------------------------------------------------
// validation helpers
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FULL_SHA = /^[0-9a-f]{40}$/;
const REPO_URL = /^https:\/\/github\.com\/gthgomez\/Babel(\/|$)/;
const LOCAL_ASSET = /^\/?media\//;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ProductContentError(`${field}: non-empty string required`);
  }
  return value;
}

function expectStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
    throw new ProductContentError(`${field}: array of strings required`);
  }
  return value as string[];
}

function expectDate(value: unknown, field: string, today?: string): string {
  const date = expectString(value, field);
  if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    throw new ProductContentError(`${field}: ISO date (YYYY-MM-DD) required, got "${date}"`);
  }
  // Review dates must be deliberate content, not build timestamps.
  if (today !== undefined) {
    const todayOk = ISO_DATE.test(today);
    if (!todayOk) throw new ProductContentError(`today: ISO date required`);
    if (Date.parse(date) > Date.parse(today)) {
      throw new ProductContentError(
        `${field}: review date ${date} is in the future (relative to ${today}) — review dates are deliberate content, not build dates`
      );
    }
  }
  return date;
}

function expectEnum<T extends string>(
  value: unknown,
  field: string,
  values: readonly T[]
): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    throw new ProductContentError(
      `${field}: must be one of ${values.join(" | ")} (got ${JSON.stringify(value)})`
    );
  }
  return value as T;
}

// ---------------------------------------------------------------------------
// evidence
// ---------------------------------------------------------------------------

function parseEvidence(input: unknown, field: string): EvidenceRecord {
  if (!isPlainObject(input)) throw new ProductContentError(`${field}: object required`);
  const kind = expectEnum(input.kind, `${field}.kind`, [
    "source",
    "pull_request",
    "check_run",
    "release",
    "capture",
  ]);
  const url = expectString(input.url, `${field}.url`);
  if (!/^https:\/\//.test(url)) {
    throw new ProductContentError(`${field}.url: https URL required`);
  }
  if (kind === "source" && !REPO_URL.test(url)) {
    throw new ProductContentError(`${field}.url: source evidence must reference the Babel repository`);
  }
  const record: EvidenceRecord = {
    id: expectString(input.id, `${field}.id`),
    kind,
    url,
    observationDate: expectDate(input.observationDate, `${field}.observationDate`),
    supports: expectString(input.supports, `${field}.supports`),
  };
  if (input.revision !== undefined) {
    const revision = expectString(input.revision, `${field}.revision`);
    if (!FULL_SHA.test(revision)) {
      throw new ProductContentError(`${field}.revision: full 40-char git SHA required`);
    }
    record.revision = revision;
  }
  if (kind === "source" && record.revision === undefined) {
    throw new ProductContentError(`${field}: source evidence requires a pinned revision`);
  }
  if (kind === "pull_request") {
    record.observedState = expectEnum(input.observedState, `${field}.observedState`, [
      "open",
      "draft",
      "merged",
      "closed",
    ]);
    if (record.observedState !== "merged" && record.supports.length > 0) {
      // An unmerged PR may support *investigation* notes, never release claims.
      if (/releas|publish|shipped|generally available/i.test(record.supports)) {
        throw new ProductContentError(
          `${field}.supports: an unmerged PR cannot support release claims`
        );
      }
    }
  }
  return record;
}

// ---------------------------------------------------------------------------
// distributions
// ---------------------------------------------------------------------------

function parseDistribution(input: unknown, field: string): DistributionRecord {
  if (!isPlainObject(input)) throw new ProductContentError(`${field}: object required`);
  const record: DistributionRecord = {
    id: expectString(input.id, `${field}.id`),
    kind: expectEnum(input.kind, `${field}.kind`, ["source", "portable", "installer", "npm"]),
    label: expectString(input.label, `${field}.label`),
    availability: expectEnum(input.availability, `${field}.availability`, [
      "available",
      "not_available",
      "unknown",
    ]),
    signingState: expectEnum(input.signingState, `${field}.signingState`, [
      "signed",
      "unsigned",
      "not_applicable",
      "unknown",
    ]),
    evidenceIds: expectStringArray(input.evidenceIds, `${field}.evidenceIds`),
  };
  if (input.version !== undefined) record.version = expectString(input.version, `${field}.version`);
  if (input.revision !== undefined) {
    const revision = expectString(input.revision, `${field}.revision`);
    if (!FULL_SHA.test(revision)) {
      throw new ProductContentError(`${field}.revision: full 40-char git SHA required`);
    }
    record.revision = revision;
  }
  if (input.assetUrl !== undefined) {
    const assetUrl = expectString(input.assetUrl, `${field}.assetUrl`);
    if (!/^https:\/\//.test(assetUrl)) {
      throw new ProductContentError(`${field}.assetUrl: public https URL required`);
    }
    record.assetUrl = assetUrl;
  }
  if (input.checksum !== undefined) record.checksum = expectString(input.checksum, `${field}.checksum`);
  if (input.reason !== undefined) record.reason = expectString(input.reason, `${field}.reason`);

  // Download readiness: an "available" binary (non-source) distribution needs a
  // real public asset, a matching version or revision, a checksum, and signing
  // disclosure. Source installs never require an asset.
  if (record.availability === "available" && record.kind !== "source") {
    if (!record.assetUrl) {
      throw new ProductContentError(
        `${field}: an available download requires a public assetUrl`
      );
    }
    if (!record.version && !record.revision) {
      throw new ProductContentError(
        `${field}: an available download requires a version or revision`
      );
    }
    if (!record.checksum) {
      throw new ProductContentError(`${field}: an available download requires a checksum`);
    }
    if (record.signingState === "unknown") {
      throw new ProductContentError(
        `${field}: signing state must be disclosed for an available download`
      );
    }
  }
  if (record.availability === "not_available" && !record.reason) {
    throw new ProductContentError(`${field}: an unavailable distribution requires a reason`);
  }
  return record;
}

// ---------------------------------------------------------------------------
// media
// ---------------------------------------------------------------------------

export function validateMediaRecord(input: unknown): MediaRecord {
  if (!isPlainObject(input)) throw new ProductContentError("media record: object required");
  const file = expectString(input.file, "media.file");
  if (!LOCAL_ASSET.test(file)) {
    throw new ProductContentError(
      "media.file: must reference a reviewed site asset under media/"
    );
  }
  const kind = expectEnum(input.kind, "media.kind", ["reference_ui", "real_session"]);
  const record: MediaRecord = {
    file,
    altText: expectString(input.altText, "media.altText"),
    kind,
    digest: expectString(input.digest, "media.digest"),
    rights: expectString(input.rights, "media.rights"),
    scope: expectString(input.scope, "media.scope"),
  };
  if (input.revision !== undefined) {
    const revision = expectString(input.revision, "media.revision");
    if (!FULL_SHA.test(revision)) {
      throw new ProductContentError("media.revision: full 40-char git SHA required");
    }
    record.revision = revision;
  }
  if (input.captureDate !== undefined) {
    record.captureDate = expectDate(input.captureDate, "media.captureDate");
  }
  if (kind === "real_session") {
    if (!record.revision || !record.captureDate) {
      throw new ProductContentError(
        "media: a real_session capture requires a pinned revision and capture date"
      );
    }
    if (/illustrat|reference|simulat/i.test(record.altText)) {
      // A real capture must not describe itself as illustrative either.
      throw new ProductContentError("media.altText: a real session cannot be labeled illustrative");
    }
  }
  return record;
}

// ---------------------------------------------------------------------------
// changelog
// ---------------------------------------------------------------------------

export function parseChangelogEntries(input: unknown): ChangelogEntry[] {
  if (!Array.isArray(input)) throw new ProductContentError("changelog: array required");
  return input.map((entry, i) => parseChangelogEntry(entry, `changelog[${i}]`));
}

function parseChangelogEntry(input: unknown, field: string): ChangelogEntry {
  if (!isPlainObject(input)) throw new ProductContentError(`${field}: object required`);
  const record: ChangelogEntry = {
    date: expectDate(input.date, `${field}.date`),
    category: expectEnum(input.category, `${field}.category`, ["release", "development"]),
    title: expectString(input.title, `${field}.title`),
    summary: expectString(input.summary, `${field}.summary`),
    sourceUrl: expectString(input.sourceUrl, `${field}.sourceUrl`),
  };
  if (!/^https:\/\//.test(record.sourceUrl)) {
    throw new ProductContentError(`${field}.sourceUrl: https URL required`);
  }
  if (input.revision !== undefined) {
    const revision = expectString(input.revision, `${field}.revision`);
    if (!FULL_SHA.test(revision)) {
      throw new ProductContentError(`${field}.revision: full 40-char git SHA required`);
    }
    record.revision = revision;
  }
  if (record.category === "development") {
    // An unmerged development milestone must not read like a release.
    if (/released|published|download/i.test(record.title)) {
      throw new ProductContentError(
        `${field}: a development milestone title cannot claim release/publication`
      );
    }
  } else if (record.revision === undefined) {
    throw new ProductContentError(`${field}: a release entry requires a revision`);
  }
  return record;
}

// ---------------------------------------------------------------------------
// snapshot
// ---------------------------------------------------------------------------

export function parseProductSnapshot(input: unknown, options?: { today?: string }): ProductSnapshot {
  if (!isPlainObject(input)) throw new ProductContentError("snapshot: object required");
  if (input.schemaVersion !== 1) {
    throw new ProductContentError(`snapshot.schemaVersion: expected 1`);
  }
  const repository = expectString(input.repository, "snapshot.repository");
  if (repository !== "https://github.com/gthgomez/Babel") {
    throw new ProductContentError(
      "snapshot.repository: the Babel product source of truth is github.com/gthgomez/Babel"
    );
  }
  const sourceRevision = expectString(input.sourceRevision, "snapshot.sourceRevision");
  if (!FULL_SHA.test(sourceRevision)) {
    throw new ProductContentError("snapshot.sourceRevision: full 40-char git SHA required");
  }
  const reviewedAt = expectDate(input.reviewedAt, "snapshot.reviewedAt", options?.today);

  const evidenceRaw = input.evidence;
  if (!Array.isArray(evidenceRaw)) throw new ProductContentError("snapshot.evidence: array required");
  const evidence = evidenceRaw.map((e, i) => parseEvidence(e, `snapshot.evidence[${i}]`));
  const evidenceIds = new Set(evidence.map((e) => e.id));
  if (evidenceIds.size !== evidence.length) {
    throw new ProductContentError("snapshot.evidence: duplicate evidence IDs");
  }

  if (!Array.isArray(input.features)) throw new ProductContentError("snapshot.features: array required");
  const features: FeatureRecord[] = input.features.map((f, i) => {
    if (!isPlainObject(f)) throw new ProductContentError(`snapshot.features[${i}]: object required`);
    const record: FeatureRecord = {
      id: expectString(f.id, `snapshot.features[${i}].id`),
      label: expectString(f.label, `snapshot.features[${i}].label`),
      availability: expectEnum(f.availability, `snapshot.features[${i}].availability`, AVAILABILITY_VALUES),
      qualification: expectEnum(
        f.qualification,
        `snapshot.features[${i}].qualification`,
        QUALIFICATION_VALUES
      ),
      scope: expectString(f.scope, `snapshot.features[${i}].scope`),
      limitations: expectStringArray(f.limitations, `snapshot.features[${i}].limitations`),
      evidenceIds: expectStringArray(f.evidenceIds, `snapshot.features[${i}].evidenceIds`),
    };
    return record;
  });
  const featureIds = new Set(features.map((f) => f.id));
  if (featureIds.size !== features.length) {
    throw new ProductContentError("snapshot.features: duplicate feature IDs");
  }
  for (const feature of features) {
    for (const id of feature.evidenceIds) {
      if (!evidenceIds.has(id)) {
        throw new ProductContentError(
          `snapshot.features[${feature.id}]: references unknown evidence "${id}"`
        );
      }
    }
    // Source presence is not live qualification.
    if (feature.availability === "released" && feature.qualification === "not_qualified") {
      throw new ProductContentError(
        `snapshot.features[${feature.id}]: released features cannot be marked not_qualified`
      );
    }
  }

  if (!Array.isArray(input.distributions)) {
    throw new ProductContentError("snapshot.distributions: array required");
  }
  const distributions = input.distributions.map((d, i) =>
    parseDistribution(d, `snapshot.distributions[${i}]`)
  );
  const distributionIds = new Set(distributions.map((d) => d.id));
  if (distributionIds.size !== distributions.length) {
    throw new ProductContentError("snapshot.distributions: duplicate distribution IDs");
  }
  for (const distribution of distributions) {
    for (const id of distribution.evidenceIds) {
      if (!evidenceIds.has(id)) {
        throw new ProductContentError(
          `snapshot.distributions[${distribution.id}]: references unknown evidence "${id}"`
        );
      }
    }
    // A public artifact must match a disclosed revision/version.
    if (distribution.assetUrl && distribution.revision && distribution.revision !== sourceRevision) {
      // Cross-revision assets are allowed only when versioned; the pairing is
      // reviewed content, so no hard failure — but an asset claiming to be the
      // pinned snapshot while pointing elsewhere is suspicious. Enforce
      // explicitness instead of guessing.
      if (!distribution.version) {
        throw new ProductContentError(
          `snapshot.distributions[${distribution.id}]: asset revision differs from snapshot revision without an explicit version`
        );
      }
    }
  }

  return {
    schemaVersion: 1,
    repository,
    sourceRevision,
    reviewedAt,
    features,
    distributions,
    evidence,
  };
}

// ---------------------------------------------------------------------------
// display helpers
// ---------------------------------------------------------------------------

export function getInstallActions(snapshot: ProductSnapshot): InstallAction[] {
  const actions: InstallAction[] = [];
  const source = snapshot.distributions.find(
    (d) => d.kind === "source" && d.availability === "available"
  );
  if (source) {
    actions.push({
      label: "Install from source",
      href: "/docs/getting-started/install/",
      kind: "source",
      notice: null,
    });
  }
  for (const distribution of snapshot.distributions) {
    if (distribution.kind === "source") continue;
    if (
      distribution.availability === "available" &&
      distribution.assetUrl &&
      (distribution.version || distribution.revision) &&
      distribution.checksum &&
      distribution.signingState !== "unknown"
    ) {
      actions.push({
        label: distribution.label,
        href: distribution.assetUrl,
        kind: "download",
        notice:
          distribution.signingState === "unsigned"
            ? "This bundle is unsigned."
            : null,
      });
    } else {
      // Unknown or unqualified installs get an explanatory state, not a link.
      actions.push({
        label: distribution.label,
        href: "/status/",
        kind: "download",
        notice:
          distribution.reason ??
          "Not yet published. See status for what exists in source today.",
      });
    }
  }
  // A verified source path is always offered first when it exists.
  return actions;
}

export function getFeatureSummary(
  snapshot: ProductSnapshot,
  id: string
): FeatureSummary {
  const feature = snapshot.features.find((f) => f.id === id);
  if (!feature) {
    throw new ProductContentError(
      `unknown feature id "${id}" — add it to the snapshot or fix the caller; never render a default success`
    );
  }
  return {
    id: feature.id,
    label: feature.label,
    availability: feature.availability,
    qualification: feature.qualification,
    scope: feature.scope,
    limitations: feature.limitations,
  };
}
