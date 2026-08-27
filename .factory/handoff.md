# Glassline repair handoff — 2026-08-27

## What changed

- Made the declared `npm run test:e2e` workload deterministic by setting Playwright to one worker. This is intentional isolation, not a retry or suppressed failure: each CSV flow creates a DuckDB-WASM worker and concurrent engines can crash Chromium in the constrained test environment.
- Added a streamed quote-structure preflight for CSV, TSV, TXT, and other delimited-text imports. It supports escaped quotes and quoted multiline fields, but rejects unterminated quoted fields, quotes inside unquoted fields, and non-delimiter text after a closing quote before DuckDB opens a view.
- Reused the existing import-error dialog and delimiter/header/all-text retry controls for the preflight error, so malformed input never silently enters the workspace.
- Added exact regression coverage: unit cases for valid escaped/multiline fields, unterminated quote (including its opening row), and inconsistent closing-quote structure; desktop and 390 px browser coverage that asserts the malformed-file recovery dialog and controls.
- Retained direct browser file-handle ingestion, the 100-row virtual grid, local-only DuckDB processing, and CSV/Parquet exports. The validator reads byte chunks from the source stream and does not make a JavaScript-size copy of a multi-GB file.

## How to run

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` is intentionally serial and runs both desktop Chromium and the 390×844 mobile project. Browser installation is Playwright's normal explicit prerequisite after a clean dependency install.

For the large-file path, run the preview and benchmark in separate terminals:

```sh
npm run preview -- --port 4173
GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs
```

## Verification performed

- Clean `npm ci`: passed; audit reported 0 vulnerabilities.
- `npm test`: passed, 7/7 tests across SQL-builder and CSV-structure suites.
- `npm run build`: passed and emitted `dist/`.
- Built `dist/staticwebapp.config.json`: confirmed `/assets/*` uses `Cache-Control: public, max-age=31536000, immutable`; CSP, Permissions-Policy, Referrer-Policy, `nosniff`, and clickjacking protections are present. `/sw.js` remains `no-cache`.
- `npx playwright install chromium && npm run test:e2e`: passed, 10/10, with the configured default one worker. Coverage includes desktop and 390×844 mobile, keyboard shortcuts, landing/workspace axe serious/critical checks, offline shell reload, CSV/XLSX import, filtering/grouping/pivot/SQL, CSV export, and malformed quoted-CSV recovery.
- Large-file benchmark: 5,000,000 rows, 1,012,961,173 bytes, first workspace plus exact count in **16.51 seconds** (below the product's 30-second target).
- Live deployment header check: `https://big-csv-browser-viewer.sociobot.in` served the expected CSP/security headers, immutable cache policy for hashed assets, and `no-cache` for `/sw.js`. The live HTML SHA-256 remained the prior deployed candidate (`97279e…`), while this repaired local build is `7bf91b…`; no deployment was attempted because deployment is factory-owned.

## Known limits and next steps

- Delimited text remains UTF-8-only. XLSX still converts only the first worksheet locally and is necessarily more memory-intensive than CSV.
- The streamed validation intentionally validates quoting rather than attempting to repair malformed records. Users can choose another file or retry with the existing import settings.
- Browser memory limits vary, especially on Safari. The 1 GB benchmark above was run in Chromium in this worker container.
- A factory deployment is still required before byte-for-byte live parity can be rechecked for this repair commit.
