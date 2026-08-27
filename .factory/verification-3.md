# Independent verification 3 — FAIL

**Date:** 2026-08-27  
**Candidate:** `544fb50fe4df8f9daebd2fb8ee04a512846413ef`  
**Live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Verdict

**FAIL — high-severity release blocker.** The candidate is deployed and the previous production CSP failure is fixed: normal CSV, TSV, and XLSX flows open successfully in the live browser. However, the advertised and brief-required **Parquet export is broken**. A two-row CSV reaches the workspace, but choosing Parquet and pressing **Export file** immediately leaves the export dialog open and displays:

```
The local engine reported: table index is out of bounds
```

No download is created. The failure occurred in 242 ms in a fresh Chromium session and was reproduced again by a separate 90-second download-observation probe. CSV export works. The smallest useful product contract requires export of filtered CSV/Parquet, so shipping with Parquet unavailable is a FAIL even though the primary CSV workflow remains usable.

## Clean candidate and automated checks

The worktree was clean and at the requested SHA before verification. No product source code was changed by this verifier.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci` installed 126 packages; audit reported 0 vulnerabilities. |
| Unit tests | PASS | `npm test`: 2 files, **7/7** tests passed. |
| Type check and exact production build | PASS | `npm run build` ran `tsc --noEmit` and Vite successfully and emitted `dist/`. |
| Local production browser suite | PASS (with coverage gap) | `npm run test:e2e`: **14/14** passed; Playwright final record reports `status: passed`. The suite covers desktop and 390×844 mobile, CSV filter/group/pivot/read-only SQL/CSV export, TSV, XLSX first sheet, malformed CSV recovery, engine-start recovery, offline reload, exact CSP, and axe serious/critical checks. It does **not** exercise Parquet export. |
| Live deployed browser suite | PASS (with same coverage gap) | `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npx playwright test`: **14/14** passed; its final run record is `status: passed`. |
| Large-file brief target | PASS locally | Fresh 5,000,000-row, 1,012,961,173-byte CSV (`GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150`) opened and exact-counted in **22.04 s**, under the 30 s target. |

## Independent live end-to-end evidence

Separate from the repository tests, fresh Chromium exercised a valid boundary CSV containing a quoted multiline field and an escaped quote. It opened as 3 rows; a typed numeric boundary filter `amount <= 500` correctly yielded 2 rows. Keyboard `/` opened filters, `g` moved focus to the grid, invalid `DELETE FROM data` was rejected as non-read-only SQL, and filtered **CSV** export downloaded `glassline-export-2026-08-27.csv`.

| Area | Result | Evidence |
| --- | --- | --- |
| Normal CSV / numeric boundary / quoted input | PASS | 3-row quoted/multiline input opened; `<= 500` produced 2 rows. |
| TSV and XLSX | PASS | Both live repository-browser cases passed (TSV and first XLSX worksheet). |
| Filter, group, pivot, SQL, CSV export | PASS | Live browser suite passed; independent SQL rejection and CSV download also passed. |
| Invalid import and engine recovery | PASS | Live suite passed unterminated-quote recovery and forced engine-start failure/retry dialog tests. |
| **Parquet export** | **FAIL — High** | Reproduced on live URL with `region,amount\nNorth,1\nSouth,2\n`: selecting Parquet then exporting produced the error above after 242 ms, kept the dialog open, and produced no download. |
| Desktop and 390 px mobile | PASS | Independent mobile probe: `innerWidth: 390`, `documentElement.scrollWidth: 390`; both Playwright projects passed. |
| Keyboard and visible focus | PASS | First Tab reached “Skip to main content” with `rgb(102, 242, 189) solid 3px` outline; `/` and `g` worked in the loaded workspace. |
| Reduced motion | PASS | Under `prefers-reduced-motion: reduce`, drop-zone computed transition duration was `1e-05s`. |
| Console and page errors | PASS for successful flows | Independent live normal CSV/filter/CSV-export probe collected none. Parquet failure is handled visibly as a toast, not a console/page error. |
| Accessibility | PASS for tested screens | Local and live Playwright axe checks found zero serious/critical findings on landing and populated workspace, desktop and mobile. `<html lang>`, title, one h1, main landmark, skip link, image alt, and focus state are present. |

## Deployment, privacy, browser policy, and performance evidence

Deployment parity is **PASS**. Fresh local `dist/index.html` and live `/` have the same SHA-256:

```
35bedca4bd53e0680a562a4cdcebe0e1237f8258c3ca0080d4c80af20b0cf810
```

All 13 fresh built files under `dist/assets/` (main/async/engine JS, CSS, both workers, both WASM modules, both hero formats, and source maps) also matched their live counterparts byte-for-byte.

- Live CSP is the candidate policy and includes the narrow DuckDB allowance: `script-src 'self' 'wasm-unsafe-eval'`; `connect-src 'self'`, `worker-src 'self' blob:`, `object-src 'none'`, and `frame-ancestors 'none'` are present.
- Live response headers also include HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, restrictive Permissions-Policy, and Referrer-Policy. Hashed `/assets/*` files are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`.
- A normal live import/CSV-export probe observed only `https://big-csv-browser-viewer.sociobot.in` requests. Static inspection found no upload endpoint, tracker, analytics, third-party runtime script, CDN font, or CDN asset. `/privacy/` and `/terms/` both return 200. The service worker only caches same-origin shell/assets.
- Service-worker update check passed live: `registration.update()` completed with an active `/sw.js`, controller present, and cache `glassline-shell-v2`; the live suite also passed offline shell reload.
- Build budget passes: initial main JS is 32.08 KB uncompressed (10.79 KB gzip), CSS is 19.16 KB (5.09 KB gzip). The large DuckDB WASM files are deferred until file selection.

## Required repair and verification

Repair the DuckDB-WASM Parquet export path so a filtered CSV can actually download `*.parquet` without a toast error. Add an automated browser assertion that selects Parquet and awaits a `.parquet` download; current coverage only asserts CSV. Then rerun `npm test`, `npm run build`, local browser tests, and the deployed-URL Parquet smoke test under production headers.

## Scope

This is a static web app, not a library, CLI, backend, or payment product. Consumer-package, backend concurrency/persistence/health, and payment checks do not apply.
