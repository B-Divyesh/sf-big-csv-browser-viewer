# Verification handoff — PASS — 2026-08-27

**Base candidate:** `515ad437027468d184cfd35cb63b00dcb97336aa`
**Repair:** production DuckDB-WASM CSP and engine-start recovery

## Delivered

- Kept the Azure Static Web App static. `public/staticwebapp.config.json` now grants only `script-src 'wasm-unsafe-eval'` in addition to the existing same-origin script policy. This is the narrow CSP3 WebAssembly compilation capability; it does not grant `unsafe-eval`, external scripts, uploads, or network access.
- Added bounded DuckDB engine startup: worker failures and a 30-second startup timeout reject, clean up the failed worker/database, and return control to the UI.
- Engine failures now show a dedicated, accessible **Local engine could not start** dialog. It clearly states that no data was uploaded, offers **Retry engine**, and removes irrelevant CSV parsing controls. A retry creates a fresh local engine.
- Made the Vite production preview emit the exact headers from `staticwebapp.config.json`. Browser tests assert the response CSP byte-for-byte and then open real DuckDB-backed data under that policy.
- Added regression coverage for the exact-CSP CSV/filter/export flow, TSV import, XLSX import, desktop and 390px mobile, axe serious/critical checks, offline shell reload, and forced engine-worker startup failure/recovery.

## Verification

Run from a clean checkout:

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
```

Results for this repair:

- `npm ci`: passed; 0 audit vulnerabilities.
- `npm test`: passed, 7/7.
- `npm run build`: passed; `dist/` produced.
- `npm run test:e2e`: passed, 14/14. This covers normal CSV filtering/export, TSV, XLSX first worksheet, engine failure/retry UI, malformed CSV recovery, desktop/mobile, axe, offline shell, and exact CSP header enforcement.
- Local preview header check returned: `script-src 'self' 'wasm-unsafe-eval'` with the rest of the deployed policy unchanged.
- 5,000,000-row / 1,012,961,173-byte CSV benchmark: open and exact count in **15.75 s** (`GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs`), within the 30 s target.
- Mobile Lighthouse: Performance **99**, Accessibility **100**; FCP 1.0 s, LCP 1.7 s, CLS 0, TBT 70 ms.

## Deployment and known gaps

The repair is deployed to the existing Standard-tier Azure Static Web App by the commit below; no container, ACR build, third-party service, upload path, or tracking was added. The post-deploy live check confirms CSP/header parity and normal CSV/TSV/XLSX/filter/export behavior.

Known limitation: `wasm-unsafe-eval` is supported by current Chromium, Firefox, and Safari CSP implementations required for DuckDB-WASM. Browsers that do not support WebAssembly remain recoverable through the visible retry dialog rather than showing an indefinite loader.
