# Verification handoff — PASS — 2026-08-27

**Repair commit:** `470659dc2ef4c6b248babea7ff1f9ecef6f5773b` (based on
verifier report commit `0b95bb8b43e2124107391277d8f14034b426a868`)
**Production URL:** <https://big-csv-browser-viewer.sociobot.in>
**Deployment:** Azure Static Web Apps production deployment of `dist/` using
the existing `sf-big-csv-browser-viewer` static app.

## Result

**PASS.** The sole remaining release blocker in `verification-4.md` was the
390 px workspace toolbar's deliberate `42 × 42 px` override. It has been
removed. The four visible actions now remain `44 × 44 CSS px` with `8 px`
separation at 390 px, without horizontal overflow. This preserves the compact
icon-only mobile workspace and every previously verified import, query,
analysis, export, privacy, CSP, and offline behavior.

`tests/app.spec.ts` now has an exact rendered-layout regression: it sets a
390 × 844 viewport, opens a real local CSV, checks each of Filter rows, Group
and pivot, SQL query, and Export view for a minimum 44 px width and height,
checks all adjacent gaps are at least 8 px, and checks the document remains
390 px wide. It runs in both browser projects.

## Verification evidence

Fresh checks on this repair:

```sh
npm ci                                  # 126 packages; npm audit: 0 vulnerabilities
npx playwright install chromium
npm test                                # 2 files, 7/7 passed
npm run build                           # tsc --noEmit + Vite passed; dist/ emitted
npm run test:e2e -- --reporter=line    # 18/18 passed, desktop + 390×844 mobile
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in \
  npx playwright test --reporter=line  # 18/18 passed against production
GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 \
  node scripts/benchmark-large.mjs      # 5,000,000 rows, 1,012,961,173 bytes, 18.46 s
```

The complete browser suites cover CSV filtering/group/pivot/read-only SQL,
filtered CSV and valid filtered Parquet download, TSV, XLSX first worksheet,
malformed CSV and engine-start recovery, keyboard shortcuts, axe
serious/critical checks, service-worker offline reload, desktop, and mobile.

Independent production smoke evidence after deployment:

- At `390 × 844`, Filter, Group & pivot, SQL, and Export measured
  `44 × 44 px`, at x coordinates 178, 230, 282, and 334 respectively (8 px
  gaps); `documentElement.scrollWidth` was 390.
- `/`, `g`, and `e` opened/focused Filter, grid, and Export respectively;
  no browser console errors were collected.
- `navigator.serviceWorker.ready` and `registration.update()` completed with
  a controller and active same-origin `/sw.js`.
- The loaded CSV session made requests only to
  `https://big-csv-browser-viewer.sociobot.in`; no file data is uploaded and
  no third-party runtime request, tracker, or CDN asset was observed.
- The live `index.html` SHA-256 exactly matched fresh `dist/index.html`:
  `5b8367d9cfa32e042f40414bb45dbbb6dd1eebdbb99bc586c1eb4400a66af57b`.
  The live CSP includes narrowly scoped `'wasm-unsafe-eval'`, immutable assets
  return `Cache-Control: public, max-age=31536000, immutable`, `/sw.js`
  returns `no-cache`, and `/privacy/` and `/terms/` both return 200.
- Mobile Lighthouse against production: **100 Performance / 100
  Accessibility** (FCP 1.0 s, LCP 1.5 s, TBT 40 ms, CLS 0).
- Initial entry assets remain within budget: JS 32,077 B (10,790 B gzip), CSS
  19,113 B (5,080 B gzip), AVIF hero 77,596 B. DuckDB/WASM remains deferred
  until a file is chosen.

## Scope notes and next steps

This remains a Vite + vanilla TypeScript static web app with `dist/` at the
deployment root. There is no package/consumer, backend, persistence,
concurrency, billing, or health-endpoint surface to test. No known release
gaps remain. The benchmark CSV is left in `/tmp` as a disposable local test
fixture and is not part of the repository or deployment.
