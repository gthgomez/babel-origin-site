# Reproducing the babel-origin-site showcase

These are screenshots and a video of the real locally running UI, captured by browser automation. Application source was unchanged. Existing license and attribution terms apply; public visibility is not a new license grant.

## Provenance

- Application source revision: [`dfaeb8b91802ff8d851272260439e9c166107d63`](https://github.com/gthgomez/babel-origin-site/tree/dfaeb8b91802ff8d851272260439e9c166107d63). The showcase commit adds documentation/media only.
- Captured 2026-10-30 with Chromium 154.0.8037.57, 1280 × 900, en-US / UTC.
- [Machine-readable capture manifest](capture.json) records scenario, source SHA, timing, blocked hosts, screenshot labels, media byte sizes and SHA-256 checksums.
- MP4: 16.3 seconds, silent H.264. GIF: 1.02× playback, 4 fps, reduced palette/size. JPGs are direct viewport captures. Only the video/GIF receives a provenance caption; no UI is generated or reconstructed.
- Actual browser footage of this static website. The tour and terminal transcripts are explicitly illustrative reference content; they are not captured Babel executions or verification receipts.

## Run locally

Use this PR branch (the baseline revision above predates the added capture scripts). From the repository root, start the application in one terminal:

```bash
npm ci
npm run build
python3 -m http.server 4313 --bind 127.0.0.1 --directory dist
```

In another terminal, install the isolated capture-tool dependencies and record. Requirements: Node compatible with the project, Chromium, FFmpeg and ffprobe on PATH. On Linux, the default browser path is `/usr/bin/chromium`; set `CHROMIUM_PATH` for your system. Installing Playwright's small FFmpeg helper supports its temporary WebM recorder; system FFmpeg creates the committed MP4/GIF. No hosted account or external media upload is needed.

```bash
npm ci --prefix docs/showcase
npx --prefix docs/showcase playwright install ffmpeg
node docs/showcase/capture.mjs
```

`SHOWCASE_URL` can override the local server origin; only loopback hosts are accepted. `CHROMIUM_PATH` and `FFMPEG_PATH` override executables. In restricted environments, put npm, corepack and Playwright caches in writable directories and use the same `PLAYWRIGHT_BROWSERS_PATH` during helper installation and capture. Do not point this script at production.

The script launches a new browser context with empty storage, blocks non-loopback requests, operates the actual UI, records a temporary WebM, creates the compact deliverables in `media/`, writes `capture.json`, and removes its own temporary recording directory. Rerunning replaces only showcase media and its manifest. Fonts can differ slightly because external font requests are blocked.

## Workflow and limits

Open website; browse reference tour and its Evidence panel; read source-linked quickstart documentation.

This README showcases `babel-origin-site`, not the Babel runtime owned by another repository. `src/data/media.json` stays empty because these assets demonstrate website navigation and illustrative tour panels, not runtime execution. No product proof or media registry claims were added. Generated media lives under `docs/showcase/`, outside `public/`.

Source surfaces inspected: `src/pages/index.astro`, `src/pages/tour.astro`, `src/content/docs/getting-started/quickstart.mdx`, `src/data/media.json`.

## Validation

`npm run check`, `npm test` (428 passed, 8 skipped), `npm run build`, and `npm run check:build`: passed. All 37 Playwright checks passed against the built artifact using system Chromium; the temporary test configuration changed only the browser executable and worker count.

Every screenshot and sampled video frames were visually inspected. Browser capture reported no uncaught page errors. README links, media checksums, encodings, file sizes, and final Git diff were reviewed. Public hosted links, when listed, received a read-only HTTP 200 check only; no production UI interaction, account setup, cloud sync, deployment, or paid inference was performed.
