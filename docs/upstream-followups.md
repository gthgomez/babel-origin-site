# Upstream follow-ups — Babel product source

Concrete documentation contradictions observed in `gthgomez/Babel` at
`cf17c00da3c51678fd010ed645224686dcea94b0` and rechecked on 2026-10-06 at
`2aa0200dcf65a18d80183a8eecd5e5c370c9f7f3`. The cited files are unchanged between
those revisions, so the contradictions still stand. The site campaign does not
repair the Babel runtime; these are recorded so they can be delivered as
separate, authorized docs-only upstream changes.

## UF-1: `dev_local` is documented as day-to-day host coding but denies project-code tests/builds

**Contradiction.** User-facing docs present `dev_local` as the host fallback for
ordinary coding work; the implementation restricts it to intrinsic inspection.

**Documentation side (says "day-to-day host work"):**
- `docs/CHAT_MODE.md` line 172: "Host-friendly local coding (`dockerSandbox: false`).
  No Docker requirement; use for day-to-day host work without isolation containers;
  executes directly on your host — trusted repositories only." (see also lines 180–191)
- `docs/BABEL_USER_SHAPED_CLI_GUIDE.md` line 60: "`dev_local` executes approved tools
  directly on your host with no container isolation."
- `docs/STATUS.md` line 35: "`dev_local` runs approved tools on the host…"
- `docs/architecture/BABEL_LOCAL_MODE.md` lines 164–173: "Prefer for everyday host
  work without a sandbox image."
- `docs/CLI_QUICKSTART.md` lines 27, 75–76: offers `dev_local` as a fallback before
  running coding tasks.

**Implementation side (inspection-only):**
- `babel-cli/src/config/executionProfiles.ts` lines 141–158: description =
  "Intrinsic inspection commands only; project-code and container-only commands are
  denied"; swe prompt line: "Project-code execution (npm/cargo/go/java/gradle tests
  and builds) is denied without Docker isolation."

**Impact for site docs:** the first-coding-task guide must not offer `dev_local` as
a bypass when a coding run is blocked by missing Docker; it documents the actual
enforcement and points to isolation setup instead.

**Proposed upstream fix:** align the six doc files with the enforcement (state that
`dev_local` permits intrinsic inspection only), or extend the profile if host coding
is actually intended. Whichever changes, keep quickstart prose consistent with
enforcement tests.

## UF-2: Site-facing status claims are undated and unscoped

`docs/STATUS.md`, unchanged at `2aa0200d`, describes features without qualification dates or
evidence links. When the site links a Babel status doc, readers cannot tell what was
verified, when, or how. Proposal: date-stamp and scope each capability claim in
`docs/STATUS.md`, or expose a machine-readable snapshot the site can pin.
