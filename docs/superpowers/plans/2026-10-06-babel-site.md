# Babel website/docs packet — 2026-10-06-babel-site (retained planning artifact, 2026-10-06)

Babel Website and Documentation Implementation Plan
For agentic workers: Use superpowers:executing-plans when available to implement this plan task-by-task. Otherwise use the host's normal sequential implementation workflow with the same checks. One implementing agent owns the campaign; a separate reviewer may inspect the final exact head where available. This packet does not require a swarm.

Goal: Replace Babel's outdated static microsite with a polished, maintainable product website, 18 useful documentation pages, and evidence-scoped status/download/changelog experiences.
Architecture: One static Astro application with custom marketing pages and Starlight documentation. Small local JSON records drive product status, distribution actions, and media labels; web guides link to exact Babel source revisions. No backend, duplicate agent runtime, or network dependency in normal site builds.
Tech Stack: Astro, Starlight, TypeScript, system-font CSS, built-in Pagefind, existing Vitest, Playwright, and an accessibility test integration. Retain npm and a committed package-lock.json. Resolve compatible stable package versions at T01; do not copy outdated version assumptions.
Spec: 01-PRODUCT-SPEC.md in this packet. Copy the spec into docs/superpowers/specs/2026-10-06-babel-site.md and this plan into docs/superpowers/plans/2026-10-06-babel-site.md if retaining them in the repository. Neither location is published into the web docs.
Global Constraints
- Target gthgomez/babel-origin-site; Babel runtime repository is read-only unless separately authorized.
- One campaign branch, one active task at a time, focused commits, one final PR by default.
- Use Babel as short wordmark and Babel Harness as full product name; do not rename packages, binaries, repositories, domains, or the actual Desktop application.
- Retain the existing Vercel hostname/project; no assumed babel.dev domain.
- Astro + Starlight, static output in dist/; public/ is source assets, never the generated output directory.
- Chat-first positioning; Plan and Deep are additional modes, not guaranteed stronger reliability.
- No fake benchmarks, live results, verified badges, provider compatibility, install commands, screenshots, release dates, or download availability.
- Ordinary builds and browser sessions make no GitHub/provider/model content requests and require no credentials.
- One root site AGENTS.md; preserve existing license boundaries and security intent.
- Do not silently weaken CSP, tests, content checks, branch rules, or current-user authorization requirements.
- Continue through reversible in-scope implementation without phase-by-phase approval requests. A blocked external operation does not stop independent site-local work.
Review Focus
1. A merged source feature without a published binary must never produce a download CTA; cover T03/T06.
2. An old source snapshot or an unmerged PR must never masquerade as newly qualified current behavior; cover T03/T05/T08.
3. A framework migration can look correct locally while CSP breaks search, theme, or code copy in production; cover T02/T07/T08.
4. Existing /demo/index.html, slash variants, query strings, and #proof/#limits links must remain useful without redirect loops; cover T02/T07.
5. Missing credentials, Docker, native Desktop execution, or live-run media must produce honest instructions and fallback presentation—not fake success or a blocked entire campaign; cover T04/T05/T06.
File ownership and target structure
Files are planned paths, not a claim that they already exist. Inspect the current tree and adapt equivalent existing ownership rather than duplicating it.
AGENTS.md                         # short site-only contributor policy
README.md                         # local use, architecture, sources, deployment, licensing
astro.config.mjs                  # static build, Starlight, slugs/sidebar, CSP choices
tsconfig.json
package.json / package-lock.json  # exact scripts, compatible locked dependencies
vercel.json                       # dist output, redirects, security headers
.github/workflows/ci.yml          # dependency install before checks/build, artifact validation
src/
  content.config.ts              # Starlight collection plus source metadata schema
  content/docs/                  # 18 real pages; explicit slugs start with docs/
  pages/
    index.astro
    tour.astro
    download.astro
    status.astro
    changelog.astro
    security.astro
    404.astro
  layouts/MarketingLayout.astro  # shared product-page head/nav/footer
  components/
    SiteHeader.astro
    SiteFooter.astro
    Hero.astro
    ProductMedia.astro
    ModeCards.astro
    FeatureStatus.astro
    InstallActions.astro
    DocsSourceNote.astro
  styles/tokens.css              # shared colors/spacing/type
  styles/marketing.css           # marketing-only layout
  styles/docs.css                # minimal Starlight theme overrides
  data/product-status.json
  data/changelog.json
  data/media.json
  lib/product-content.ts         # data schemas, readiness rules, presentation helpers
public/
  favicon.ico
  media/                         # reviewed images/video only; no runs or private artifacts
scripts/
  check-content.ts               # validate data/docs sources/public copy
  check-build.ts                 # emitted routes, local links, leaks, asset budgets
  check-sources.ts               # explicit read-only remote refresh audit; never in build
tests/
  product-content.test.ts
  content-policy.test.ts
  routes.test.ts
  csp.test.ts
  media.test.ts
  e2e/
    navigation.spec.ts
    docs.spec.ts
    product.spec.ts
    security.spec.ts
    accessibility.spec.ts
playwright.config.ts
docs/
  implementation-baseline.md
  migration-map.md
  security-decision.md
  content-maintenance.md
  upstream-followups.md
  release-checklist.md
  superpowers/specs/...
  superpowers/plans/...
Avoid creating further architectural layers unless a concrete requirement needs them.
Migrate assets/site.css, assets/site.js, root index.html, demo/index.html, scripts/build-public.cjs, scripts/serve.cjs, and scripts/check-site.cjs only after their useful behavior and tests have replacements. Preserve historical source in Git, not in a published /legacy directory.
Delivery sequence
Task	Independently reviewable result	Depends on
T01	Verified baseline, decisions, source inventory, existing-test record	Nothing
T02	Static Astro/Starlight vertical slice, routing and security compatibility proof	T01
T03	Typed product data and truthful-claim/download rules	T02
T04	Finished product layout, homepage, and shared visual system	T03
T05	18 substantive, source-linked user docs and usable navigation	T03, T04 shared styles
T06	Tour, Get Babel, status, changelog, and security pages	T03–T05
T07	Full built-artifact QA, CI, SEO, search, accessibility, and performance checks	T02–T06
T08	Exact-head review, source refresh, release-ready handoff	T07


Do not merge intermediate scaffolding into a production-deployed main merely because one task passes. Keep the production site unchanged until a coherent candidate has cleared the whole acceptance checklist.
T01 — Establish the source and implementation baseline
Files: Create docs/implementation-baseline.md, docs/migration-map.md, docs/upstream-followups.md, and a concise root AGENTS.md only if absent. Preserve any existing instruction authority.
Interfaces: Consumes repository state and this packet. Produces the selected site/base SHA, pinned Babel reference SHA, chosen toolchain versions, observed baseline checks, and a mapping from every legacy route/check to a replacement.
- [ ] Inspect remote identity, current branch, working tree, upstream main, and open site PRs. Read applicable root/host instructions. Use an isolated feature worktree through existing helpers when available; do not assume Windows or /workspace paths.
- [ ] Name the campaign branch feat/babel-product-site-docs, or use the host-required equivalent. Preserve unrelated work. Reuse an existing matching authorized branch instead of creating competing work.
- [ ] Record the actual current site main and Babel main SHAs. Compare with this packet's snapshot. Inspect current release assets, #308/#309 or their successors, and relevant merged changes. Record uncertainty instead of guessing.
- [ ] Read the actual site HTML, CSS, JS, build/check scripts, CI, security tests, .gitignore, .vercelignore, LICENSE, and SECURITY.md. Inventory the behavior currently covered by the interaction and header tests; do not preserve stale business claims just because their tests pass.
- [ ] Resolve stable Astro/Starlight versions and their Node compatibility through official docs and registry metadata. Example discovery commands: npm view astro version engines --json and npm view @astrojs/starlight version peerDependencies engines --json. Record exact selections and rationale. Site tooling requirements and Babel runtime requirements are separate.
- [ ] Run the existing dependency installation/check/test/build sequence under its supported environment. Record each exit code and failure before making repairs. A pre-existing failure does not become a pass because it predates this task.
- [ ] Add a migration map for required routes, content checks, privacy/secret safeguards, build output, tests, and license notices. Capture the dev_local documentation contradiction as an upstream follow-up with exact source paths and revisions.
- [ ] Add site instructions covering architecture, verification commands as they become available, public-source/proprietary boundaries, and authorized operations. Do not copy Babel's entire contributor policy into this smaller repo.
- [ ] Commit the baseline and instruction change with explicit file staging: docs: record Babel site migration baseline.
Exit condition: An engineer can identify the exact starting state, inherited failures, source authority, toolchain choice, and legacy behaviors that must survive. No dependency on a new domain, paid inference, or product runtime change was introduced.
T02 — Prove the framework, route layout, and CSP before polishing
Files: Create Astro/TypeScript/Starlight configuration, one real docs introduction with slug: docs, src/layouts/MarketingLayout.astro, minimal real marketing and reference-tour pages, tests/routes.test.ts, and the security-browser test harness. Modify package scripts, lockfile, vercel.json, CI ordering, .gitignore, and .vercelignore. Migrate legacy build/serve scripts and content checks coherently.
Interfaces: Produces a static dist/, custom pages at /, docs at /docs, the selected canonical-slash/redirect policy, and docs/security-decision.md documenting the actual tested CSP approach. Later tasks consume these routes/layouts and must not create a second build system.
- [ ] Write tests named marketing_and_docs_have_distinct_routes, legacy_demo_routes_reach_tour, unknown_route_is_not_homepage, and private_repository_files_are_not_public_assets. Assert that root and /docs are distinct, static assets resolve, and LICENSE/notes/credentials/build scratch are not accidentally copied as website files.
- [ ] Run npm test -- tests/routes.test.ts. Establish a meaningful RED against the old layout: the requested docs/route artifacts do not exist. Dependency-installation failure alone is not the intended regression proof.
- [ ] Install the recorded stable versions with npm, commit the lockfile, set output to dist/, and configure custom marketing pages alongside Starlight docs. Keep base at /; give every guide an explicit docs/... slug. Use src/content.config.ts with the installed supported schema API.
- [ ] Establish a real introduction page containing product purpose, source-install link, and maturity boundary. Temporary build probes must stay out of production navigation and be removed before T08.
- [ ] Change Vercel output to dist; preserve security headers and route compatibility. Make public/ contain only deliberate source assets. Remove the obsolete self-copy/public-output path rather than running two builders.
- [ ] Before adding rich pages, build a representative docs page with a code block and enable search/theme/copy behavior. Exercise the built output under the intended response headers, not only on the dev server. Capture console and securitypolicyviolation events.
- [ ] Resolve inline theme/highlighter/search compatibility using supported external assets or generated hashes. Do not add blanket unsafe-inline or unsafe-eval. Test any necessary narrow WebAssembly exception. Ensure a meta CSP and response-header CSP do not contradict each other.
- [ ] Record the selected working approach in docs/security-decision.md, including exact versions, effective directives, tested behaviors, remaining hosted-preview checks, and any minimal justified override. Prefer a supported configuration over a custom sanitizer/security framework.
- [ ] Move dependency installation before build/checks in CI and use npm ci. Correct the stale lockfile comment. Preserve the existing Validate static site job identity unless a live required-check change is separately authorized.
- [ ] Re-run route/security tests and a build. Expected GREEN: custom home, docs, and planned redirect behavior exist; no unexpected publication; search/theme/copy operate under the effective policy. Treat an unavailable browser/hosted test as unverified, not passed.
- [ ] Commit: feat: establish static Astro and Starlight site foundation.
Exit condition: The actual selected framework works with the chosen route and security design. Do not proceed with a visually polished but CSP-broken shell.
T03 — Implement the product snapshot and claims rules
Files: Create src/lib/product-content.ts, src/data/product-status.json, src/data/changelog.json, src/data/media.json, scripts/check-content.ts, tests/product-content.test.ts, tests/content-policy.test.ts, and tests/media.test.ts. Replace obsolete required-string checks with tested current content rules.
Interfaces: Export the four helper signatures in the spec and their public types. InstallAction has label, href, kind: 'source' | 'download', and notice: string | null. FeatureSummary has the display label, availability, qualification, scope, and limitations. Unknown feature IDs fail explicitly rather than rendering a default success.
Use availability values source_only | preview_available | released | planned | unknown; qualification values source_inspected | scoped_checks | live_workflow | not_qualified | unknown. Distribution availability is available | not_available | unknown. These are site content states, not Babel runtime enums.
- [ ] Write source_presence_does_not_enable_binary_download, unmerged_pr_is_not_a_release, missing_evidence_is_not_verified, review_date_is_not_build_date, unknown_feature_fails_explicitly, and reference_media_cannot_be_live_proof tests. Use local fixtures; do not fetch GitHub during unit tests.
- [ ] Run npm test -- tests/product-content.test.ts tests/content-policy.test.ts tests/media.test.ts and confirm RED for the absent validation/derivation behavior.
- [ ] Implement strict shape validation: schema version, full Git revision, ISO review date, unique IDs, existing evidence references, appropriate URLs, and evidence revision relationships. A PR record requires its observed state/head; a source claim requires an inspected path/revision. Reject a future review date in an explicit audit with injected current date, without making normal builds time-dependent.
- [ ] Implement getInstallActions: always offer the verified source path when available; add a binary action only when its public artifact and required evidence are present. Unknown or unqualified installers produce explanatory text, not a download link. Preserve unsigned preview notices.
- [ ] Seed the snapshot from inspected source. Do not classify a whole feature as live-qualified based on a unit test, a package test, a README example, or another branch's PR body. Do not hard-code #308 or #309 as permanent blockers; derive the new snapshot after a future real release.
- [ ] Replace obsolete positive regex requirements for old prompt-stack/doctor/bl copy with source-scoped checks and assertions against the rendered public surface. Preserve privacy checks and test them with synthetic fixtures. Permit explanatory phrases such as “API key” in credential setup docs; detect sensitive values/unsafe publication rather than banning legitimate terminology wholesale.
- [ ] Allow deprecated strings inside explicit migration notes or negative test fixtures; do not write a repository-wide ban that prevents testing/documenting the migration. They must not reappear as current public product claims.
- [ ] Validate media records and their files/digests; missing media yields a reference fallback, never invented capture metadata. Keep media.json empty until a valid asset is available.
- [ ] Re-run the tests; expected GREEN for legitimate source-only and reference content, RED for every false-readiness fixture. Commit: feat: add source-bound product status and claims validation.
Exit condition: Homepage/status/download components can consume one small trusted-by-review content model. Structural validation is not described as semantic verification of Babel.
T04 — Build the professional visual system and homepage
Files: Create shared CSS tokens, marketing styles, header/footer, Hero, ProductMedia, ModeCards, FeatureStatus, InstallActions, and the finished src/pages/index.astro. Extend tests/e2e/product.spec.ts and navigation.spec.ts.
Interfaces: MarketingLayout accepts title, description, and canonical path. ProductMedia accepts a validated MediaRecord or uses a reference fallback. FeatureStatus and InstallActions receive parsed snapshot data; they do not reimplement readiness decisions.
- [ ] Write browser assertions for hero_has_real_next_step, chat_is_primary_mode, preview_label_stays_visible, status_cards_match_snapshot, and mobile_navigation_is_keyboard_operable. Assert CTA destinations and accessible names, not pixel equality with a competitor.
- [ ] Run focused browser tests against the current built skeleton and confirm RED for the missing behavior.
- [ ] Implement the exact hero copy and section order from the spec. Ensure the product can be understood without reading architecture. Keep one clear maturity note near the hero and more detail on /status.
- [ ] Apply the graphite/gold/cyan token system across the site and map it onto Starlight. Use system fonts, responsive grid/layout, semantic buttons/links, and mobile-first spacing. Do not copy a competitor brand or redesign the actual Desktop product.
- [ ] Add #proof and #limits anchor compatibility. Keep obvious source links and clear separation between Babel's product license and the site's current proprietary source/assets.
- [ ] At 390×844 and 1440×900, capture the rendered homepage and docs shell. Inspect typography, spacing, line wrapping, image legibility, and focus states. Fix the actual captures; do not claim a design review from CSS source alone.
- [ ] Re-run focused tests with no horizontal page overflow; code blocks may scroll within their own containers. Commit: feat: build Babel product homepage and shared visual system.
Exit condition: A coherent homepage and docs shell with functioning navigation and honest visual evidence—not an Astro starter with a changed title.
T05 — Author the first-use documentation and source notes
Files: Create the 18 pages enumerated in the spec, DocsSourceNote.astro, src/styles/docs.css, content metadata validation, and tests/e2e/docs.spec.ts. Add exact contradictions to docs/upstream-followups.md.
Interfaces: Each guide supplies title, description, explicit docs slug, page type, source revision, reviewed date, interfaces, prerequisites, and source paths. The shared metadata component renders these consistently. The docs navigation references only completed pages.
- [ ] Write tests all_required_guides_have_sources, sidebar_has_no_placeholder_routes, quickstart_separates_no_key_and_provider_steps, coding_guide_does_not_offer_dev_local_test_bypass, and source_and_edit_links_have_distinct_owners.
- [ ] Run relevant unit/content/browser tests and confirm RED for missing pages/source metadata.
- [ ] Re-read the exact Babel source needed for each page. Do not use this packet's summaries as the source for detailed commands. Where docs and enforcement disagree, follow actual implementation and state the limitation.
- [ ] Write all 18 substantive pages. Tutorials contain prerequisites, commands, an observable expected state, and what to do on failure. Guides answer a task; concepts explain meaning; reference pages identify their exact coverage. Do not scatter the same installation commands or configuration table across many pages.
- [ ] Use shell-labeled PowerShell and POSIX examples where commands differ. Copy buttons copy only the command, not a prompt glyph. Use public-safe example paths and placeholders; no real credentials or operator machine paths.
- [ ] Verify the source-build/help/doctor examples in an isolated disposable clone when the host permits it. Record real outputs and environment. A no-key diagnostic may intentionally report missing prerequisites; exit zero is not the only legitimate documented outcome.
- [ ] Do not spend on a provider or weaken isolation to complete a screenshot/tutorial. Label unexecuted provider-backed examples as walkthrough examples. The first-coding-task page must explain blocked/unverified outcomes and must not claim the task has already been qualified.
- [ ] Keep full runtime reference/architecture authority in Babel. Add precise upstream links rather than mirroring the whole docs tree. Do not present a planned persistent daemon or one-runtime refactor as an implemented architecture.
- [ ] Re-run content tests and manually follow Home → Get started → Install → Quickstart → Troubleshooting → Chat. Expected GREEN: no broken path, ungrounded command, blank page, or missing source note. Commit: docs: add source-grounded Babel getting-started and usage guides.
Exit condition: The docs are useful for a new user and truthful under failure. No claim of a five-minute setup or successful live edit without measurement.
T06 — Finish the product tour, distributions, status, and changelog
Files: Implement tour.astro, download.astro, status.astro, changelog.astro, security.astro, shared display components, and related browser/unit tests. Add reviewed assets only when available.
Interfaces: All status/download displays use the T03 helpers; all visual tours use media/reference labels; changelog entries distinguish release and development without inferring release state from merged code.
- [ ] Write tests tour_never_dispatches_a_provider, reference_label_survives_tab_switching, unknown_download_has_no_binary_cta, development_milestone_is_not_release, and website_and_product_security_boundaries_are_distinct.
- [ ] Run the tests and confirm RED for missing routes and display rules.
- [ ] Implement Chat/Plan/Deep/Evidence tour sections with accessible controls and a no-JavaScript-readable fallback. An illustrative trace is explanatory content, not a copied Babel verification receipt. Keep the reference label visible through every interaction.
- [ ] Build /download with source-install guidance and platform/distribution cards. A missing binary shows a reason and relevant source/status link. No fabricated shell installer; no automatic executable download; no expiring CI artifact as default distribution.
- [ ] Build /status with snapshot revision/date, source availability, qualification scope, limitations, and public evidence links. Do not label it live monitoring or display invented uptime.
- [ ] Build /changelog from reviewed local entries. Read actual release/merge dates. Source development milestones may be visible but must say they are not yet a public binary release. Do not scrape every commit or expose internal operational notes.
- [ ] Build /security with the existing reporting channels and source links. Preserve LICENSE/SECURITY.md authority. Do not claim compliance certification, zero logging by the host, or that provider-backed inference stays on-device.
- [ ] When authentic media exists, validate provenance and display its scope. Otherwise finish with the designed reference interface; put live capture on the separate qualification checklist rather than blocking all delivery.
- [ ] Verify that a normal user session loads no provider/GitHub API request, telemetry, third-party video iframe, or unapproved remote font. Re-run tests. Commit: feat: add Babel tour distribution status and changelog pages.
Exit condition: Every public route is meaningful today, even before a qualified public installer or live session capture exists.
T07 — Harden the built artifact and the maintenance path
Files: Complete CI, scripts, Playwright configuration, accessibility/security tests, 404 page, metadata/sitemap/robots, docs/content-maintenance.md, and docs/release-checklist.md. Remove obsolete legacy sources/scripts only after replacement coverage.
Interfaces: Define these exact npm command names and keep README/CI aligned:
Command	Contract
npm run dev	Start the Astro development server.
npm run check	Astro/TypeScript check plus content/schema/source-metadata validation.
npm test	Deterministic unit tests; no live GitHub/provider requests.
npm run build	Static production build using committed content; output dist/.
npm run preview	Preview the built site locally.
npm run check:build	Validate emitted routes, internal links/anchors, publication allowlist, and transfer budgets.
npm run test:e2e	Browser tests against the built artifact, including search.
npm run check:sources	Explicit read-only source-refresh audit; does not rewrite content or run inside build.
npm run verify	Run check, unit tests, build, built-artifact validation, and browser tests in dependency order.


- [ ] Write failing tests for an invalid internal anchor, a missing source record, a stale hand-typed status, a published private-path fixture, a blocked Pagefind request, and a mobile menu that cannot return focus. Make failures diagnostic.
- [ ] Implement the content/build validators and commands. Share schemas/helpers rather than duplicating readiness logic. Remote-source checks must distinguish “upstream moved” from “our pinned snapshot is invalid”; retain the reviewed snapshot until it is intentionally refreshed.
- [ ] Configure CI with checkout → supported Node → npm ci → checks/tests/build → artifact checks/browser tests. Pin added tooling and avoid downloading floating validators at runtime. Run deterministic checks on Linux; add a Windows build/check lane to catch path/case/newline assumptions without running an unnecessary full browser matrix everywhere.
- [ ] Test every primary route in Chromium at 360×800, 390×844, 768×1024, and 1440×900. Smoke-test home, Quickstart, and search in Firefox/WebKit when supported by the CI runner. Record skips honestly.
- [ ] Build then test Pagefind searches for “install,” “Docker,” “permissions,” and “resume.” Each must return an appropriate real guide. Test no-results, keyboard selection, Escape, focus return, and search failure without losing docs navigation.
- [ ] Check security in the actual browser: effective CSP, copy/theme/search behavior, no unintended remote requests, and anti-framing headers. A local fixture attaching configured headers tests the policy design, not Vercel deployment parity; reserve actual hosted-header checks for T08.
- [ ] Run automated accessibility checks over public pages and representative docs. Manually test keyboard-only navigation, headings/landmarks, focus visibility, 200% zoom, reduced motion, high-contrast readability, and table/code overflow. Fix serious/critical findings.
- [ ] Measure the selected transfer budgets. Run and record three Lighthouse samples on home and Quickstart with a fixed environment; compare medians to spec targets. Do not label lab output as real-user INP or a formal accessibility certification.
- [ ] Add page titles/descriptions, the existing owned-host canonicals, descriptive social metadata, robots and sitemap, a useful 404, and preview no-index behavior based on a trusted build environment. Preview builds must not manufacture a different production domain.
- [ ] Keep internal plans, followups, node_modules, tests, build logs, raw evidence, and credential-shaped data out of dist. Do not publish an entire source directory simply to make a link validator pass.
- [ ] Remove retired HTML/assets/scripts and obsolete test assumptions; preserve equivalent behavior checks and useful existing security tests. Document the migration mapping and source-refresh procedure.
- [ ] Run npm ci in a clean worktree, then npm run verify. Expected GREEN: all required site-local acceptance tests pass against the final artifact. Commit: test: qualify Babel website docs and production build.
Exit condition: Site behavior is demonstrated by production-build tests, not just checked source files or screenshots.
T08 — Refresh evidence and deliver the exact candidate
Files: Complete release/handoff notes; change product data only when freshly supported. No runtime or account changes.
Interfaces: Consumes the exact reviewed site HEAD, passing local/hosted results, and current source snapshot. Produces the handoff in 03-ACCEPTANCE-AND-HANDOFF.md format.
- [ ] Re-read current Babel main, release assets, and relevant qualification PR state. Identify claims affected by new changes. Keep the snapshot pinned until reviewed; do not substitute a moving main link for evidence.
- [ ] Run npm run check:sources. Record whether content is current to its disclosed snapshot and which new changes need a deliberate update. Verify actual dates and distribution URLs before any public download claim.
- [ ] Review the whole branch against the spec and checklist. Use a fresh-context reviewer where available; give it exact base/head, full diff, screenshots, test results, and permission scope. If no independent reviewer exists, report self-review accurately.
- [ ] After repairs, re-run affected tests and the full final verification. Record the exact final SHA and clean staged/working-tree state. Evidence from a superseded head cannot approve a changed candidate.
- [ ] Push the feature branch/create the PR only under applicable authorization; include changes, screenshots, source revisions, tests, failures/skips, licensing, security decisions, and deferred product qualifications. Do not claim that producing this packet granted merge/deploy permission.
- [ ] If an authorized Vercel preview exists, verify its deployed site revision and inspect actual routes, redirects, headers, search, metadata, and mobile UI. A Vercel Ready state alone is insufficient. Without access/authorization, mark hosted verification pending and complete the source/PR handoff.
- [ ] Do not merge or deploy production until exact-head checks, required review, and recorded authorization permit it. Remember a merge can itself trigger production deployment; merge permission must cover that consequence. Do not force-push, disable branch rules, or change account settings to make release happen.
- [ ] Record rollback: preserve the previous production deployment/revision and revert through normal authorized Git/deployment controls. Do not rewrite shared history or delete the last working build.
- [ ] Deliver the checklist and final report. Separate site implementation complete, hosted preview verified, production deployed, and Babel product qualification rather than collapsing them into “done.”
Exit condition: A verifiable, reviewable site candidate with clear remaining release or product dependencies, not an unqualified launch claim.
Practical stop/continue rules
Continue local implementation when a product installer, provider key, live demo, public release, or deployment credential is unavailable. Use a truthful source-install path/reference tour and report the external dependency.
Stop only the dependent operation for denied access, secrets, spending, destructive actions, out-of-scope runtime changes, or missing release authorization. Do not silently bypass the issue; do not halt unrelated documentation/design work.
When source contradicts the packet, preserve the product outcome but update the implementation facts with exact evidence. Record the delta. Do not cling to October 6 PR states after a later release, and do not quietly turn roadmap into a claim of shipped behavior.