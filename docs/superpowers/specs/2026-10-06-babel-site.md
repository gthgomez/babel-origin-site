# Babel website/docs packet — 2026-10-06-babel-site (retained planning artifact, 2026-10-06)

Babel product website and documentation — implementation specification
Packet date: October 6, 2026
Target repository: gthgomez/babel-origin-site
Product source of truth: gthgomez/Babel
Execution model: One implementing agent, sequential tasks, one campaign branch.
Purpose: Replace the outdated proof microsite with a professional product website, task-oriented documentation, and an honest release/status surface.
This specification implements the direction already discussed with Jonathan. Do not restart the branding/framework brainstorm or ask him to repeat decisions. Read 02-IMPLEMENTATION-PLAN.md next. Facts below are a dated planning snapshot, not permanent release assertions. Sources and known verification limits are in 04-SOURCE-REGISTER.md.
1. Product outcome
A new visitor should be able to understand what Babel is, see its actual interface or an explicitly labeled reference tour, find the currently supported installation path, and reach a useful first-session guide without learning the architecture first.
The three distinct experiences are:
- Product website: why Babel exists, what work it is intended for, and how to start.
- Documentation: how to install, configure, use, and troubleshoot it.
- Project status and changelog: what exists in source, what has been tested, and what is actually distributed.
Professionalism means clear information hierarchy, working navigation and search, usable mobile layouts, correct instructions, accessible interaction, and maintainable content—not just a polished hero image.
2. Decisions that are already settled
Decision	Implementation
Framework	Astro with Starlight, statically generated. No Next.js migration, SSR, application backend, database, or account system.
Styling	Shared CSS tokens and Starlight customization. Do not introduce React or Tailwind solely for this site.
Search	Starlight's built-in Pagefind integration. No hosted search account or AI search backend.
Hosting	Keep the existing Vercel project and hostname. Do not buy, assume ownership of, or configure another domain.
Brand	Use Babel as the short wordmark and Babel Harness as the full product name. Preserve the actual packaged application name.
Surfaces	Desktop, terminal/TUI, headless CLI, and currently supported integrations. These are interfaces to Babel, not new products with separate runtimes.
Product hierarchy	Chat is the daily/default mode. Plan is planning before mutation. Deep adds workflow structure; it is not a blanket reliability upgrade.
Architecture hierarchy	Product first; inspectable execution and evidence second; Prompt OS and deeper architecture later.
Repository policy	One root AGENTS.md for this site. No vendor-specific or nested competing instruction files.
Content model	Small typed data records for status, distributions, media, and changelog; Markdown/MDX guides with pinned sources. Not a general-purpose CMS.
Deployment	Produce a release-ready candidate. Push, merge, preview publication, and production deployment require existing explicit authorization covering the operation. Do not repeatedly request permission already granted.


Naming correction: the earlier babel.dev example was illustrative, not an approved domain. Do not use it in canonicals, install scripts, screenshots, links, or configuration. Do not rename the repository, npm package, binaries, or application as part of this campaign.
3. Scope and exclusions
Included
The existing site repository's source, dependencies, build configuration, tests, CI, route migration, README, site-specific contributor instructions, user-facing content, and public-safe media. Author new web guides grounded in Babel's actual behavior. Create a documented content refresh process.
Excluded
Babel runtime, permissions, verification logic, provider adapters, catalog refactors, installer development, signing, npm publication, paid model calls, a cloud agent, an in-browser execution service, pricing/subscriptions, analytics, email capture, competitor comparison scores, an exhaustive model directory, a plugin marketplace, and a second documentation publishing platform.
Do not expand this site campaign into fixing Babel's ordinary coding loop. A missing product capability is a documentation boundary, not permission to implement that capability.
The Babel repository is read-only by default for this packet. Record concrete documentation contradictions and proposed corrections in a site-local upstream-followup note. An upstream docs-only change can be delivered separately only when authorized; it must not silently become a prerequisite for finishing the website.
4. Planning baseline and essential corrections
The site tree inspected for this packet was d60c17eb816786a712fef5fda7af6a93b1331a0e. Babel main was cf17c00da3c51678fd010ed645224686dcea94b0.
The site is currently hand-authored HTML/CSS/JS. Its build writes to public/. Its checker requires obsolete prompt-stack wording and the old doctor/demo story. CI currently runs the build before installing dependencies and retains a no-lockfile comment even though the repository contains a lockfile. Its CSP restricts scripts and styles to same-origin resources; its security tests inspect configuration rather than proving browser behavior. [S01–S05]
Babel PR #308 was an unmerged draft with installer lifecycle qualification still blocking distribution. PR #309 was also unmerged, based on a campaign branch, and explicitly distinguished mocked regression proof from an installed live coding run. Do not publish either PR's work as generally available behavior. A PR's merge_commit_sha can represent a test merge; use the actual merged state and ancestry, not the presence of that field. [S07–S08]
The existing source documentation and dev_local implementation have a known contradiction: documentation suggests ordinary host coding while the execution profile describes inspection-only host commands and denies project-code tests/builds without isolation. Re-read the actual implementation and relevant enforcement before writing instructions. Never offer a host-fallback switch as an easy workaround for a blocked coding run. [S09]
5. Information architecture
Public routes
Route	Job
/	Product homepage; explain the product and direct visitors to a real next step.
/tour	Accessible, clearly labeled product/interface walkthrough. No live execution.
/download	Get Babel: source installation first; distribution cards only when supported by actual assets and evidence.
/docs	Task-based documentation landing page.
/status	Dated product capability and qualification snapshot, not a hosted uptime dashboard.
/changelog	Human-readable release entries and separately labeled development milestones.
/security	Reporting paths and a concise explanation of the website/product security boundaries.
/404	Useful recovery page with home, docs, and search access.


Primary navigation: Product · Docs · Changelog · GitHub, with Get Babel as the action. Product points to the homepage workflow section. The logo returns home. Footer links include Status, Security, source repositories, and the applicable license notices.
Keep the normal documentation sidebar separate from the marketing navigation. Do not create a header with every internal subsystem.
Route compatibility
Keep inbound URLs useful: /index.html → /; /demo, /demo/, and /demo/index.html → /tour. Preserve #proof and #limits anchors on the homepage with meaningful corresponding content or anchor aliases. URL fragments are not sent to the server; do not pretend server redirects can inspect them.
Use one canonical trailing-slash policy, preserve queries, avoid redirect chains/loops, and test on the built site and an authorized hosted preview. Do not blanket-redirect unknown paths to the homepage.
First-release docs: 18 useful pages, not 60 empty pages
URL under /docs	Page responsibility	Main source to inspect
/	Choose installation, daily use, troubleshooting, or deeper concepts.	Babel README / status
/getting-started/install	Source installation; separate Desktop build/preview from published downloads.	README, package engines, Desktop install docs
/getting-started/quickstart	A no-key setup/doctor checkpoint, then a separately labeled provider-backed first conversation.	START_HERE, CLI setup/doctor/interactive contracts
/getting-started/first-coding-task	A disposable-repo walkthrough with prerequisites and truthful blocked/unverified outcomes.	Chat docs and relevant current verification behavior
/getting-started/troubleshooting	Missing runtime/provider/Docker, blocked execution, and where to inspect diagnostics.	Doctor/setup code and profile enforcement
/using-babel/chat	Daily interaction, tool activity, approvals, outcomes.	CHAT_MODE and current commands
/using-babel/plan	Planning behavior and boundaries; do not imply website approval executes work.	Current Plan entrypoint/contracts
/using-babel/deep	Additional ceremony and limitations; no reliability ranking.	Current Deep entrypoint/contracts
/using-babel/sessions-and-recovery	Resume, checkpoints, CLI undo, limits; distinguish TUI commands.	CLI_QUICKSTART / session contracts
/interfaces/overview	Desktop/TUI/CLI/headless/MCP availability and differences.	README and interface docs
/interfaces/desktop	Native shell vs reference preview; bundled runtime, approvals, limitations.	babel-desktop/README.md and install docs
/configuration/models-and-providers	Configure only documented providers; credentials stay local to the product.	Setup/provider contracts; no secret file contents
/safety/permissions	User permission and repo policy boundaries without compliance promises.	Current permission contracts
/safety/execution-profiles	Actual supported isolation/inspection rules, especially dev_local.	Execution profiles plus enforcement
/verification/overview	What evidence means, what it does not prove, and active qualification.	Current completion/evidence contracts and status
/customization/project-instructions	How target-project instructions are used; distinct from Babel contributor policy.	Current instruction-loading behavior
/reference/cli	A clearly scoped reference for the documented commands, with canonical source links.	Parser/help contracts and CLI_QUICKSTART
/architecture/overview	Existing engine/client boundaries and Prompt OS, using current code—not a speculative daemon design.	Normative architecture docs and coordinator source


Architecture details, complete environment-variable catalogs, exact JSON schema reference, Repo Hunt, specialized integrations, and versioned-doc archives are follow-up content. Do not add empty sidebar entries for them.
6. Homepage and visual specification
Exact opening copy
Eyebrow: Babel Harness · Pre-1.0
Headline: A coding agent that shows its work.
Description: A local coding agent with inspectable instructions, explicit permissions, and visible verification results. Start with Chat; use Plan or Deep when you need more structure.
Primary action: Get started → /docs/getting-started/quickstart
Secondary action: View GitHub → canonical Babel repository.
One adjacent maturity note: Ordinary coding-loop reliability is under active qualification.
These are product positioning statements, not proof that every edit has been independently verified. Keep the qualification note visible and link to /status; do not repeat a wall of caveats in every section.
Section order
1. Hero and real product media, or an explicitly labeled reference interface.
2. One concrete workflow: inspect → change → check → review evidence. Present it as an explanation unless backed by an actual captured run.
3. Chat / Plan / Deep with Chat visually primary and short descriptions.
4. Inspectable, permission-controlled, evidence-oriented, recoverable: user benefits linked to guides, without claiming universal guarantees.
5. Desktop and terminal surfaces; headless and MCP as secondary developer links.
6. Compact current-state summary and recent changes, both from the same typed data used by their dedicated pages.
7. Short Prompt OS / architecture section and final real get-started action.
Do not include fake customer logos, invented testimonials, fabricated stars/download counts, unqualified benchmark percentages, “enterprise ready,” or promises that code never leaves the computer. Local execution does not imply local model inference.
Visual system
Use the existing graphite, warm gold, and cyan identity. Suggested starting tokens are existing colors, not a substitute for contrast tests: background #0e1014, panel #171b22, text #f3f1ec, muted #a9b1bd, gold #d7b45f, cyan #78c6d8. Treat success, warning, and failure colors as semantic; always pair them with text.
Use system sans-serif for prose and system monospace for commands, paths, tool activity, and hashes. No font service is required. Marketing content max width approximately 1200 px; readable doc prose approximately 70–78 characters wide. Body text 16–18 px, comfortable line height, consistent 4/8 px spacing scale, visible focus rings, and restrained borders/shadows.
The website may be redesigned; the actual Babel Desktop interface must not be reimagined as if a different design already shipped. Respect the existing North Star reference. Reuse only assets with appropriate rights and public-safe contents.
One selected design direction is enough. Produce desktop/mobile browser captures of the implementation and refine them. Do not spend the campaign generating alternate brands.
7. Content ownership and maintenance
The site owns web navigation, concise tutorials, explanatory summaries, and presentation. Babel owns executable contracts, runtime behavior, full operational reference, and authoritative implementation evidence.
Do not copy the whole Babel docs directory or create a second hand-maintained configuration catalog. Link to deep source material. Site pages may summarize and explain, but must carry a source list with repository, exact revision, and file paths. A source link proves provenance, not the correctness of the prose: an agent must still read the cited material.
Use src/content.config.ts with Starlight's supported loader/schema for the installed version. Explicitly assign every web guide a slug beginning docs/. Starlight's content folder name does not automatically mount routes at /docs; do not set Astro's global base to /docs, which would also relocate the marketing site. [S10]
Each substantive guide has a title, description, page type (tutorial, guide, concept, or reference), source revision, reviewed date, applicable interfaces, known prerequisites, and source paths. Use one custom metadata component for this information. “Edit this page” targets the site guide; “Implementation source” targets Babel. Do not point both at the same place indiscriminately.
Normal builds read only committed content/data. No GitHub, provider, or model requests during page rendering or ordinary builds. Updating the pinned product snapshot is a reviewed content change, not a live feed. Do not set reviewedAt to the build date automatically.
8. Small data contracts
Use one focused src/lib/product-content.ts module, plus small JSON data files. Do not build a policy engine.
- ProductSnapshot: schema version, Babel repository, exact source revision, review date, feature records, distribution records, and evidence records.
- FeatureRecord: stable ID, label, availability, qualification, narrowly stated scope, limitations, evidence IDs.
- EvidenceRecord: ID, kind (source, pull_request, check_run, release, capture), URL, revision where applicable, observation date, and what it supports.
- DistributionRecord: source/portable/installer/npm kind, availability, version/revision, asset URL and checksum when applicable, signing state, and evidence IDs.
- ChangelogEntry: date, category (release or development), title, short summary, source revision, and source URL. An unmerged PR cannot be a released milestone.
- MediaRecord: file, alternative text, kind (reference_ui or real_session), source revision, capture date, asset digest, rights/provenance, and scope of what is actually shown.
Availability and qualification are separate dimensions. A feature existing in source is not evidence of a successful user workflow. A passed package-install test is not a live-model quality score. A source-available Desktop bundler is not a public Desktop download.
Expose these narrow helpers with unit tests:
parseProductSnapshot(input: unknown): ProductSnapshot
getInstallActions(snapshot: ProductSnapshot): InstallAction[]
getFeatureSummary(snapshot: ProductSnapshot, id: string): FeatureSummary
validateMediaRecord(record: MediaRecord): void
Derive display states; do not type separate inconsistent labels into each page. Validators must reject malformed/missing references and unsupported download readiness. They do not automatically prove semantic truth; that remains a source-review task.
9. Distribution and media rules
/download is useful even when only source installation is available. Show supported requirements, source commands, documentation, and explicit unavailable states—not disabled buttons with no explanation.
Do not publish npm install babel, a made-up curl/PowerShell installer URL, or a Download for Windows action unless the exact distribution is publicly available, intended for this product, and qualified for that claim. Avoid confusion between Babel Harness and other software named Babel.
A downloadable installer requires a real public asset, matching revision/version, checksum, lifecycle qualification, and explicit signing state. An unsigned preview must say so and must already have been authorized for public distribution; the website agent cannot grant that authorization. Do not use expiring CI artifacts as the permanent default download.
Reference UI is permissible. Fake live verification is not. Keep Reference preview — not a live run visibly adjacent to illustrative media and tour controls. A genuine screenshot of the app's reference screen remains reference UI, not live-session proof. An actual capture records its version/revision and scope; editing/cropping must not misrepresent its results. No generated image or scripted green transcript may be presented as a real session.
Media absence does not block the whole website: implement a polished HTML/text interface tour with the reference label. A paid provider run, real capture, or new binary release is a separate qualification dependency.
10. Security, accessibility, and performance
Preserve the existing security intent. The Astro/Starlight migration must test real production output: framework theme scripts, code highlighting, and search may need different CSP handling. Astro's documentation describes limitations around inline syntax-highlighting styles; do not assume its generated CSP and the old Vercel header automatically compose. [S13]
Prefer external scripts/styles or supported build-generated hashes. Do not solve compatibility by adding blanket unsafe-inline or unsafe-eval. If Pagefind's selected build needs a specific WebAssembly directive, document and test only that narrow exception. Check the effective intersection of headers and meta policy; a hash in a meta policy does not override a stricter response header.
Keep anti-framing, MIME sniffing protection, referrer policy, no forms, no secrets, and same-origin resources by default. Test scripts, search, copy actions, theme selection, and navigation under the intended policy. Local tests do not certify Vercel's delivered headers; hosted verification is a separate gate.
Require keyboard access, skip links, semantic headings, focus restoration for dialogs, accessible names, readable contrast, reduced motion, 200% zoom, and a usable mobile sidebar. No inaccessible div-based buttons. No critical/serious automated accessibility findings on covered pages; manually check keyboard and screen-reader structure. Automated tooling alone is not a WCAG certification.
Project-selected budgets: homepage initial first-party JavaScript ≤50 KiB gzip; docs initial JavaScript ≤200 KiB gzip excluding search loaded on demand; per-page initial CSS ≤100 KiB gzip; homepage initial transfer ≤800 KiB excluding user-initiated video. Make exceptions explicit and measured, not silently ignored. Prefer no autoplay video or automatic media downloads.
Use Lighthouse as a reproducible lab check: three runs, record median performance ≥90 and accessibility ≥95 on home and Quickstart under the recorded configuration. Treat LCP ≤2.5 s, CLS ≤0.1, and INP ≤200 ms as field targets, not measurements this static-site campaign can claim from Lighthouse alone.
11. Definition of done
The full website and 18 substantive guides exist; navigation, built-site search, copy controls, mobile behavior, and legacy routes work; status and download claims share validated data; documentation is grounded in inspected sources; preview content is unmistakably labeled; normal builds do not require remote content or secrets; strict security behavior is tested; and final delivery includes actual test results and remaining external qualification limits.
The implementation is not finished merely because Astro builds, screenshots look good, or a Vercel deployment reports Ready.