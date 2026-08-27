# Independent verification 2 — FAIL

**Date:** 2026-08-27
**Candidate:** `515ad437027468d184cfd35cb63b00dcb97336aa`
**Live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Verdict

**FAIL — release blocker.** The live deployment is byte-for-byte the requested candidate, but its own deployed Content Security Policy prevents Chromium from compiling DuckDB-WASM. A representative CSV never opens: after 45 seconds the UI is still on “Reading file structure”, with no workspace and no recovery dialog. This prevents the core job-to-be-done (open/filter/pivot/export a local large CSV) in production.

The local Vite preview passes because it does not serve `staticwebapp.config.json`'s CSP headers. Therefore the green local suite is not evidence that the deployed static product works.

## Clean checkout and automated checks

The worktree was clean at the requested SHA before checks. No product code was modified by this verifier.

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 126 packages installed; `npm audit` reported 0 vulnerabilities. |
| Unit tests | PASS | `npm test`: 2 files, 7/7 tests passed (query builder and CSV quote validation). |
| Production build/type check | PASS | `npm run build`: `tsc --noEmit` and Vite succeeded; `dist/` emitted. |
| Default browser suite | PASS | After `npx playwright install chromium`, the exact `npm run test:e2e` command passed **10/10 in 42.3 s** with its configured one worker (desktop and 390×844 mobile). It exercises CSV filtering/grouping/pivot/read-only SQL/CSV export, XLSX first-sheet opening, offline shell reload, axe serious/critical checks, and malformed-CSV recovery. |
| Large-file acceptance target | PASS locally | Fresh 5,000,000-row, 1,012,961,173-byte CSV: `GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs` completed open plus exact count in **23.46 s**, under the 30 s brief target. |

## End-to-end inputs and recovery

| Input / path | Local preview | Live production |
| --- | --- | --- |
| Normal CSV (`region,status,amount`, two data rows) | PASS in the e2e suite, including filter, group/pivot, SQL and export. | **FAIL:** after exactly 45 s waiting for `orders.csv`, `#loading-layer` remained visible, `#workspace` was false, and `#error-dialog.open` was false. |
| TSV (two data rows) | Supported by the code path; not separately covered by the repository e2e suite. | **FAIL:** identical WASM CSP page error; it did not reach `orders.tsv` workspace in 45 s. |
| Valid boundary CSV | PASS locally: repository CSV tests include normal quoted values; independent valid quoted multiline/escaped-quote input was prepared for live execution but cannot start because engine initialization is blocked. |
| XLSX first worksheet | PASS locally (desktop and mobile e2e). | Blocked by the same engine initialization defect. |
| Malformed quoted CSV | PASS locally: unterminated quote opens “Check the import settings” with “Try again” and “Choose another file”; unit coverage includes closing-quote and multiline cases. | Parser is never reached because the engine fails first. |
| Recovery/cancel | PASS | On live 390×844, cancelling the blocked load returned to landing and hid the loader. This is not sufficient recovery: the failure should instead surface an actionable import/engine error. |

## Production defect

### Critical — production CSP prevents all DuckDB-backed file opens

**Reproduction (Chrome for Testing 151 / Playwright):**

1. Open `https://big-csv-browser-viewer.sociobot.in`.
2. Select a normal UTF-8 `orders.csv` with `region,status,amount` and two records.
3. Wait 45 seconds for heading `orders.csv`.

**Actual:** heading never appears; the loader remains on “Reading file structure”, no error dialog appears, and the page emits:

```
WebAssembly.instantiateStreaming(): Compiling or instantiating WebAssembly module violates the following Content Security policy directive because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".
```

**Cause:** candidate `public/staticwebapp.config.json` deploys `script-src 'self'`. DuckDB-WASM's `WebAssembly.instantiateStreaming` requires a CSP WebAssembly evaluation allowance (use the narrowly scoped `wasm-unsafe-eval` where supported, with compatibility validation) or another security-reviewed approach. The same invalid CSP is confirmed in the live response.

**Required fix:** make DuckDB-WASM executable under the production CSP, verify a normal CSV reaches workspace/filter/export on the deployed URL, and ensure initialization failures reject promptly into a visible recovery/error state instead of leaving an infinite loader. Re-run production-browser smoke tests with real deployment headers, not Vite preview headers.

## Deployment parity, privacy, and security

Deployment parity is **PASS**, which makes the live failure attributable to the candidate as deployed rather than a stale release. Fresh local `dist/` and live copies had matching SHA-256 values for:

- `index.html`: `7bf91b6d6c3a43aec933387d2aebbda147e0e47bc80e6ab52f8a161daabe90f7`
- main JS `assets/index-BJUHpaBx.js`, async JS `index-BqqU-t3H.js`, engine `engine-CHOB5kb-.js`, CSS, service worker, manifest, both artwork formats, both DuckDB workers, and both DuckDB WASM modules (all byte-identical; file names match fresh build).

Live headers include HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive Permissions-Policy, and a same-origin CSP. Hashed assets have `Cache-Control: public, max-age=31536000, immutable`; `sw.js` has `no-cache`.

Static/runtme inspection found no upload endpoint, tracker, analytics, CDN font/script, or third-party runtime request. The service worker only caches same-origin shell/assets; local files/results are not messaged to it. `/privacy/` and `/terms/` are live. The privacy claim is credible, but it does not overcome the production functional failure.

## Accessibility, mobile, PWA, and performance

These checks apply to the local production preview; live workspace accessibility cannot be exercised while loading is blocked.

| Check | Result | Evidence |
| --- | --- | --- |
| 390 px mobile | PASS | At 390×844, `scrollWidth === innerWidth === 390`. The full mobile Playwright project passed. |
| Keyboard/focus | PASS | Suite covers `/`, `g`, and `e`; independent Tab check focused the skip link with designed `rgb(102, 242, 189) solid 3px` outline. |
| Reduced motion | PASS | Computed drop-zone transition duration with `prefers-reduced-motion: reduce` was `1e-05s`. |
| Axe | PASS locally | Landing and populated workspace suite checks found zero serious/critical findings; independent mobile landing axe check also found none. |
| Console/page errors | PASS locally; **FAIL live file-open** | Local landing check collected none. Live file import emits the CSP WebAssembly page error above. |
| Service worker/offline/update | PASS locally | `navigator.serviceWorker.ready`, `registration.update()`, and activation returned a controller and `glassline-shell-v2`; cached shell reloaded while offline. |
| Lighthouse | PASS locally | Lighthouse 13.4.1: Performance **100**, Accessibility **100**; FCP 1.0 s, LCP 1.6 s, CLS 0, TBT 0 ms. |
| Budget | PASS | Initial main JS 31,414 B (10,590 B gzip), CSS 19,157 B (5,090 B gzip), AVIF hero 77,596 B. Deferred DuckDB engine is 34.2 MB and only requested after file selection. |

## Scope note

This is a static web app, not a library, CLI, or backend; consumer-package, persistence/concurrency, and health-endpoint checks do not apply.
