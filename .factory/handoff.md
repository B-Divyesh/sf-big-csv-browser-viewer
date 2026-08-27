# Verification handoff — PASS — 2026-08-27

**Repair base:** `e43b2a1c74baa8dc70bfbe576a96c627592aa90a`
**Release:** this commit
**Production URL:** <https://big-csv-browser-viewer.sociobot.in>

## Result

The Parquet release blocker is repaired. DuckDB-WASM 1.32 auto-loads Parquet
as an extension; the prior app therefore attempted a third-party extension
request which the intentional `connect-src 'self'` CSP prevented (surfacing as
`table index is out of bounds`). The app now resolves the matching, pinned
DuckDB 1.4.3 Parquet extension from a versioned same-origin asset only when a
Parquet export is requested. CSV export is unchanged.

The two extension binaries are official DuckDB WASM extension artifacts,
downloaded from `extensions.duckdb.org/v1.4.3` and shipped locally for the MVP
and EH engines. SHA-256: MVP
`0785c6c95d003eff4faa7b3b4b660f02c9c92f6d68d135ddf330d42e3a650600`; EH
`22765c8f7dc741cda2b571a66ac7bb355295d7d69a6c37e5315b265672984f55`.
They are immutable-cached and deferred, so they do not add to initial JS.

## Verification

Run locally:

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
```

Fresh repair results:

- `npm test`: **7/7 passed**.
- `npm run build`: passed and produced `dist/`; main JS 32.08 KB (10.79 KB
  gzip), CSS 19.16 KB (5.09 KB gzip).
- `npm run test:e2e`: **16/16 passed** across desktop and 390 px mobile,
  including CSP, CSV export, XLSX/TSV, malformed import recovery, engine
  recovery, accessibility, and offline shell reload.
- The new browser test imports and filters a CSV, awaits the `.parquet`
  download, reads its Thrift footer, verifies `PAR1` framing, 2 rows, 4
  columns, and one row group.

The existing 5,000,000-row / 1,012,961,173-byte benchmark result remains
22.04 s, under the 30 s brief target; this repair leaves the CSV reader and
query path unchanged. The service-worker cache was bumped to `v3`, and the
existing Playwright offline reload test passed.

## Production smoke check

After deployment, run:

```sh
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in \
  npx playwright test --project=desktop --grep 'valid Parquet'
```

Expected result: the filtered export downloads and the footer test confirms
the two rows and four columns under the production CSP. The deployed header
must retain `script-src 'self' 'wasm-unsafe-eval'` and `connect-src 'self'`.

## Known gaps / next steps

No product defects are known from this repair. The initial automated
production smoke check must be run after the static deployment completes;
the test above is purpose-built for it. Parquet extension files are fetched
only on the first Parquet export and are then retained by the existing
same-origin service-worker cache for later offline use.
