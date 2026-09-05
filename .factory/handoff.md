# Repair handoff — big-csv-browser-viewer-repair-6

Date: September 5, 2026

Implementation SHA: `69cd22503c55af9c162385ea380bae53dffbd23c`

## What changed

- Completed the public claim inventory with eleven outcome-based browser checks. New coverage proves the 5,000,000-row / about 1 GB Chromium target, real-file persistence boundaries, and separator recovery.
- Made the large-file promise measurable: the landing, metadata, footer, README, and catalog description now name the tested 5-million-row job.
- Completed route focus behavior. Home, Demo, Privacy, Terms, and 404 pages focus their route heading and announce completion for keyboard and screen-reader users.
- Removed the duplicate keyboard stop from the file-opening card while retaining its native file input and visible focus treatment.
- Added structural CSV row validation so a wrongly detected separator opens recovery controls; selecting the correct separator retries and opens the file.
- Applied the review’s plain-language repairs: no ambiguous “real workspace,” no input/output “export” collision, no CSV-only label for the broader file picker, and no unsupported deployment or tracking statements.
- Updated the catalog description and copied it to `/work/.evidence/catalog-description.txt`.

## Verification

From a clean dependency install:

- `npm ci` — passed; 0 reported vulnerabilities.
- `npm test` — passed, 9 tests.
- `npm run build` — passed; produced `dist/`.
- `npm run test:e2e` — passed, 38 desktop and 390 px browser cases. The dedicated large-file test is skipped here and run through its own claim command.
- Every command in `.factory/claims.json` passed individually. This includes all eleven `@claim:` tests.
- `npm run test:large-file` passed. The generated file had 5,000,000 rows and 1,012,961,173 bytes; the test asserts open-and-count in under 30 seconds.
- Supplemental benchmark: `GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs` completed in 15.81 seconds.
- Playwright Axe checks found no serious or critical issues on landing, populated workspace, legal pages, or 404 in the browser suite.
- `/opt/fleet/lib/verify-url.sh` passed locally and on HTTPS: title, `lang`, one h1, main, image alt text, button names, and zero console/page errors.

The standalone `@axe-core/cli` binary could not start because the worker image has ChromeDriver 152 while the supplied Playwright Chromium is 145. The Playwright Axe integration is the accessibility evidence used above.

## Deployment and HTTPS check

- Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh big-csv-browser-viewer dist` to the existing `sf-big-csv-browser-viewer` Static Web App.
- Live `index.html` SHA-256 matched the local build: `60e6b7fd7d20fb6c5ca276f84d16e4846c2b1a4105ed08b2fdc3bf9fc28b91f4`.
- Live entry script `/assets/index-BwFDfBSE.js` matched the local build: `1a9a212029473155c176bbf7bdb5841022f0f84101313c155d8c4e449639c10b`.
- `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e` passed all 38 fresh desktop and phone cases.
- Fresh first-screen checks identify the job (open a 5-million-row CSV locally), audience (analysts whose spreadsheet app cannot open the file), and first action (Try it with sample data). The sample shows realistic populated rows, its persistent demo label, reset, and isolated exit path.
- The live designed 404 returns HTTP 404 with `Page not found — Glassline`; this is expected behavior, not a defect.

## Earlier findings

All review-2 findings are resolved: F-2-1 through F-2-4 are represented by tested or removed claims, F-2-5 has route-focus regression coverage, and F-2-6 through F-2-14 have their copy or keyboard fixes. Earlier verification blockers for CSP, Parquet, mobile target size, malformed CSV, and quoted multiline CSV remain covered by the full browser suite.

## Known limits

The 5-million-row claim is measured in Chromium in this worker environment. Browser memory and speed vary, particularly on Safari; the app states that very large files can still fail.
