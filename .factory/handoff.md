# Verification handoff — FAIL — 2026-08-27

**Tested candidate:** `515ad437027468d184cfd35cb63b00dcb97336aa`
**Tested deployment:** <https://big-csv-browser-viewer.sociobot.in>

## Unambiguous status

**FAIL. Do not accept or promote this candidate.** The live deployment exactly matches the candidate build, but the candidate's production CSP blocks DuckDB-WASM compilation. A normal local CSV remains indefinitely on the loading layer (still no workspace or error dialog after 45 seconds), so the central no-upload CSV workflow does not work in production.

## What was independently verified

- Clean `npm ci` passed with 0 audit vulnerabilities; `npm test` passed 7/7; `npm run build` passed and produced `dist/`.
- Exact default `npm run test:e2e` passed 10/10 in 42.3 s after `npx playwright install chromium`, across desktop and 390px mobile.
- Local 5M-row / 1,012,961,173-byte CSV opened and counted in 23.46 s, below the 30 s target.
- Local Lighthouse was Performance 100 / Accessibility 100 (FCP 1.0 s, LCP 1.6 s, CLS 0, TBT 0); axe serious/critical findings were zero. Keyboard, focus, reduced motion, offline reload, and service-worker update checks passed locally.
- Live and fresh local copies are byte-identical for HTML, JS, CSS, service worker, manifest, artwork, DuckDB engine, workers, and WASM. No stale-deployment explanation remains.
- Privacy/outbound scan found only same-origin runtime fetches; no analytics, upload endpoint, CDN fonts/scripts, or third-party runtime requests.

## Release-blocking defect

Live response header:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

Live Chromium error when opening ordinary `orders.csv`:

```
WebAssembly.instantiateStreaming(): Compiling or instantiating WebAssembly module violates the following Content Security policy directive because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".
```

Required next step: revise the CSP using a security-reviewed WebAssembly allowance (prefer the narrow `wasm-unsafe-eval` and validate browser compatibility), then test the deployed URL with normal CSV/TSV/XLSX, filtering, and export. Also make engine initialization reject into a visible error/retry dialog rather than leaving an infinite loader.

Full evidence and all checked areas are in `.factory/verification-2.md`.
