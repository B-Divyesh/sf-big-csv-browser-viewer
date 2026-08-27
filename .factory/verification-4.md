# Independent verification 4 — FAIL

**Date:** 2026-08-27
**Candidate:** `33837c1e9921ff074aafcdb1f71fbece702824ce`
**Live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Verdict

**FAIL — one medium-severity mobile accessibility acceptance blocker.** The
previous Parquet deployment blocker is fixed: a filtered Parquet export
downloads successfully under the production CSP, and the deployed files match
this candidate byte-for-byte. The normal local workflow, CSV/TSV/XLSX import,
filtering, group/pivot, read-only SQL, CSV/Parquet export, invalid-input
recovery, offline shell, and 5M-row benchmark all passed.

The candidate nevertheless misses the factory's explicit mobile touch-target
requirement. At the required 390 px viewport, each visible workspace action
(`Filter rows`, `Group and pivot`, `SQL query`, and `Export view`) measures
**42 × 42 CSS px**. The applicable contract requires at least **44 × 44 CSS
px**. This is caused by the candidate's `@media (max-width: 420px)` rule and is
reproducible on the live deployment. Because the definition of done makes the
accessibility baseline non-negotiable, this is a release FAIL despite the
otherwise successful functional verification.

No product code was modified by this verifier.

## Clean checkout and quality gates

The worktree was clean at the requested SHA before testing. `npm ci` installed
126 packages and reported zero audit vulnerabilities. Chromium was installed
with `npx playwright install chromium` before browser testing.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| Unit tests | PASS | `npm test`: 2 files, **7/7** passed. |
| Type check and exact production build | PASS | `npm run build` ran `tsc --noEmit` and Vite, and emitted `dist/`. No separate lint script is defined. |
| Local browser suite | PASS | Exact `npm run test:e2e -- --reporter=line`: **16/16** passed in 1.1 min, desktop and the 390×844 mobile project. |
| Production browser suite | PASS | `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npx playwright test --reporter=line`: **16/16** passed in 1.2 min. |
| Browser console/page errors | PASS | Independent live normal/boundary workflow recorded zero console errors and zero `pageerror` events. |
| Lighthouse, local production preview | PASS | Mobile-default Lighthouse: Performance **99**, Accessibility **100**; FCP 1.0 s, LCP 1.9 s, TBT 100 ms, CLS 0. (The automated score does not catch the 42 px target size.) |
| Initial budget | PASS | Entry JS is 32.08 KB uncompressed (10.79 KB gzip); entry CSS is 19.16 KB (5.09 KB gzip); AVIF hero is 77.6 KB. DuckDB's 34.2 MB WASM and 197.7 KB engine chunk are lazy-loaded after file selection. |

## End-to-end product evidence

The repository suite covers normal CSV import; filter; group summary; pivot;
read-only SQL; CSV export; filtered Parquet export whose downloaded footer is
parsed and checked for two rows/four columns; TSV; first XLSX worksheet;
engine-start failure recovery; malformed quoted CSV recovery; service-worker
offline reload; and axe serious/critical checks on landing and workspace.

Independent fresh Chromium checks against the live URL additionally established:

| Scenario | Result | Evidence |
| --- | --- | --- |
| Numeric boundary and quoted values | PASS | A 3-row CSV containing `0`, `-5`, `500`, an escaped quote, and a quoted multiline cell opened as 3 rows. Typed filter `amount is at most 0` returned exactly 2 rows with no page errors. |
| SQL invalid input and recovery | PASS | `DELETE FROM data` was rejected in the SQL dialog with the explicit read-only-statement guidance; the dialog remained usable. |
| Keyboard and focus | PASS | First Tab reached the skip link, with a visible 3 px mint outline; Enter activates it. `/` opened filters and Escape closed it. |
| Reduced motion | PASS | With `prefers-reduced-motion: reduce`, drop-zone transition duration computed to `1e-05s`. |
| Service worker/offline | PASS | The live suite reloaded the cached shell offline. A live `registration.update()` completed with an activated controller, scope `/`, and only `glassline-shell-v3` present. |
| **390 px touch targets** | **FAIL — Medium** | Fresh Pixel 7/390×844 measurement found Filter, Group & pivot, SQL, and Export at **42×42 px** each. The controls are visible primary actions, so hidden dialog controls are not involved. |

The brief's large-file success target also passed independently. With the
production preview, `GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150
node scripts/benchmark-large.mjs` generated a 1,012,961,173-byte CSV and
opened plus exact-counted all 5,000,000 rows in **23.02 s**, below 30 s.

## Accessibility and mobile assessment

The complete local and live suites found zero axe serious/critical violations.
The app has a title, `lang="en"`, exactly one landing-page h1, a main landmark,
alt text for the meaningful hero illustration, a skip link, semantic dialogs,
visible focus styling, and a reduced-motion override. Visual inspection at
390 px found a purposeful compact workspace with no horizontal document
overflow. The only observed baseline failure is the deliberate reduction from
44 to 42 px at `max-width: 420px`; it must be corrected before release.

## Deployment, privacy, policies, and parity

Deployment parity is **PASS**. Fresh local production output and live bytes
matched for `index.html`, `sw.js`, manifest, privacy and terms pages, the entry
JS/CSS, lazy app and engine JS, EH WASM/worker, and both matching shipped
Parquet extensions (MVP and EH). The live HTML points to the same
`index-M3kYU__t.js` as the candidate build; the live engine and Parquet
extension SHA-256 values also matched their local `dist/` counterparts.

- The live root returned 200 with the candidate CSP: same-origin default,
  scripts and connections; only `wasm-unsafe-eval` is added for DuckDB.
  It also returned HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options:
  nosniff`, restrictive Permissions-Policy, and strict-origin referrer policy.
- `/assets/*` and `/duckdb-extensions/*` return `public, max-age=31536000,
  immutable`; `/sw.js` returns `no-cache`; the HTML has a short revalidation
  cache policy. The Parquet extension is served as `application/wasm` from the
  same origin.
- A live normal/boundary import recorded requests only to
  `https://big-csv-browser-viewer.sociobot.in` (seven requests, including the
  app shell and local engine assets). Static and runtime inspection found no
  upload endpoint, analytics, advertising, CDN font, third-party script, or
  third-party data request. The service worker filters to same-origin GETs and
  caches shell/assets only, not browser `File` contents or query results.
- `/privacy/` and `/terms/` both return 200 and accurately describe the
  local-first persistence boundary. This static web app has no library/CLI,
  backend, payment, or database-persistence surface requiring those additional
  checks.

## Required repair and re-verification

Increase the four 390 px workspace toolbar controls to at least 44×44 CSS px
(and preserve at least 8 px separation or deliberately reflow them if needed).
Then rerun the exact local and deployed Playwright suites and re-measure the
visible toolbar controls at 390 px. The Parquet extension repair itself needs
no further change based on this verification.
