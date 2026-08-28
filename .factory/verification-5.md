# Independent verification 5 — FAIL

**Date:** 2026-08-28  
**Candidate:** `14817075c5ef471c24e23cbf53de152d28d9f842`  
**Live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Verdict

**FAIL — high-severity CSV interoperability defect.** The deployed site is the requested candidate and its normal large-file workflow, accessibility, privacy, offline shell, desktop/mobile layout, and both export formats all pass. It nevertheless rejects a valid CSV containing a quoted multiline field, displaying the malformed-file recovery dialog. Selecting **Import every column as text** and trying again fails identically. This is standard CSV syntax, not invalid user input; it is especially material for operations and finance exports with address, note, or description columns. The researched brief specifically identifies CSV parsing edge cases as a constraint. A no-workaround failure to open that valid file means the real job is not reliably completed.

No product source was modified by this verifier.

## Clean candidate and automated gates

The checkout was clean and already at the requested SHA before verification. Playwright 1.62 required its matching Chromium download because the container's preinstalled browser cache was for 1.58; `npx playwright install chromium` was run before browser tests.

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci` installed 126 packages; `npm audit` reported 0 vulnerabilities. |
| Unit tests | PASS | `npm test`: 2 files, 7/7 tests passed. |
| Type/lint | PASS / N/A | `npm run build` runs `tsc --noEmit` successfully. No separate lint script is defined. |
| Exact production build | PASS | `npm run build` completed and emitted `dist/`. |
| Exact local browser command | PASS | Fresh `npm run test:e2e`: **18/18 passed in 1.3 min**. It starts `vite preview` itself and covers desktop plus 390×844 mobile. |
| Live deployed browser suite | PASS | `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npx playwright test --reporter=line`: **18/18 passed in 1.3 min**. |
| Axe serious/critical | PASS | Both landing and populated workspace are checked by the suite in both browser projects; zero serious or critical findings. |

## End-to-end evidence

| Scenario | Result | Fresh evidence |
| --- | --- | --- |
| Normal CSV | PASS | Live full suite opens CSV, filters it, runs group summary and pivot, executes read-only SQL, and downloads filtered CSV. |
| CSV numeric boundaries | PASS | Independent live `amount` values `0`, `-5`, and `500`: applying `amount <= 0` produced exactly **2 rows**. Invalid `DELETE FROM data` was rejected with the read-only-SQL guidance; no console or page errors were emitted. |
| TSV / XLSX | PASS | Live suite opens a TSV and the first worksheet of a generated XLSX fixture in both projects. |
| CSV and Parquet export | PASS | Live suite verifies filtered CSV download and parses the filtered Parquet footer, asserting two rows, four fields, and one row group. |
| Invalid CSV / engine recovery | PASS | Live suite verifies unterminated-quote recovery controls and forced local-engine startup failure/retry UI. |
| **Valid quoted multiline CSV** | **FAIL — High** | `region,note\nNorth,"first line\nsecond line"\nSouth,plain\n` is valid CSV. After 5 s on the live site: `workspace=false`, error dialog visible, message “The rows do not appear to use one consistent CSV structure…”. Checking **Import every column as text** then **Try again** fails identically. A control case with escaped quotes but no embedded line break opens successfully. |
| 390 px mobile | PASS | Full mobile project passes; explicit layout test measures each visible toolbar action at least 44×44 px with at least 8 px gaps and no 390 px document overflow. |
| Keyboard, focus, reduced motion | PASS | The suite covers `/`, `g`, and `e`; a fresh live Tab check reached the skip link with a 3 px designed outline. With `prefers-reduced-motion: reduce`, the drop-zone transition computed to `1e-05s`. |
| Offline/update | PASS | Live suite reloads the cached shell while offline. Service worker response is no-cache and cache is versioned (`glassline-shell-v3`). |

## Large-file and performance evidence

The supplied benchmark was run against a local production preview using fresh generated files:

```sh
GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=0 node scripts/benchmark-large.mjs
# {"rows":5000000,"bytes":262961173,"openAndCountSeconds":9.4}

GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs
# {"rows":5000000,"bytes":1012961173,"openAndCountSeconds":21.82}
```

The 1.013 GB / 5 million row result is under the brief's 30-second target in this environment. Live mobile Lighthouse 13.4.1 scored **99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO** (LCP 1.7 s, CLS 0, TBT 10 ms, 94 KiB initial transfer). Production output reports entry JS 32,077 B (10,790 B gzip), CSS 19,113 B (5,080 B gzip), and 77,596 B AVIF hero. The 197,658 B engine chunk and 34.2 MB DuckDB WASM are deferred until a file is chosen, keeping initial application JS inside the 200 KB budget.

## Deployment parity, privacy, and response policy

Deployment parity is **PASS**. Fresh local and live SHA-256 values matched for the root HTML and entry assets:

- `index.html`: `5b8367d9cfa32e042f40414bb45dbbb6dd1eebdbb99bc586c1eb4400a66af57b`
- `assets/index-B3FUDwnA.js`: `cd8240cfdf6f702a96e7b45227c596272f83b8d19ce8ba74a0d918c2aea331fb`
- `assets/index-BqqU-t3H.js`: `c324239c024734c655a2128a92660d4528cc91f6130eb3b4dd974d040ba1c4cc`
- `assets/index-9bc9aeQM.css`: `be4b6675ade5f9223b8d5a5757f90fb82a6c077490d12c6ad22e57e5762dde30`

The same deployed hashed DuckDB engine, workers, and both WASM binaries all return 200 with the candidate's immutable cache policy; the live browser suite exercised the engine and Parquet extension. The live root is 200 and includes HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, restrictive Permissions-Policy, strict-origin referrer policy, and a same-origin CSP with only the necessary `'wasm-unsafe-eval'` addition. `/assets/*` and `/duckdb-extensions/*` are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`.

A fresh live 390 px load recorded zero console errors, no page errors, and no cross-origin resource requests. Static inspection found no upload endpoint, analytics, trackers, advertising, CDN scripts, or remotely loaded fonts. The service worker filters caching to same-origin GETs; browser `File` contents and generated results are not requests and are not cached. `/privacy/` and `/terms/` both return 200 and accurately state these boundaries.

## Required repair

Make the DuckDB import path accept RFC-style quoted fields containing CR/LF inside the quotes, without treating the physical line as an inconsistent record. Preserve the existing rejection for unterminated or malformed quotes. Add browser regression coverage that opens the exact valid multiline fixture above (and, ideally, a CRLF variation) through the deployed CSP, then rerun the local and live suites plus the 5M/1GB benchmark.

## Scope

This is a static web application, not a library/CLI, backend, payment product, or persistent service. Consumer package, backend concurrency/persistence, and health/build-identity checks do not apply.
