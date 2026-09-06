# Repair handoff — big-csv-browser-viewer-repair-8

Date: September 6, 2026

Implementation and deployed SHA: `c6b7046e223c1a5bcaca7c9a31d149f2e2d47b75`

Live URL: <https://big-csv-browser-viewer.sociobot.in>

## Result

Both strict-review findings are fixed, committed, pushed, and deployed. Every
visible action measured by the phone regression is now at least 44 × 44 CSS
pixels. The workspace's four retained limit statements now have declared,
outcome-based claim tests. The undefined Parquet size comparison was replaced
with the tested description **Typed column data**.

The free, local-first product scope is unchanged. There is no backend,
account, payment, shared database, cloud save, or collaboration service.

## Changes

- Raised the target size of sortable grid headings, active filter chips,
  **Clear view**, Group/Pivot tabs, the jump input, the wordmark, route links,
  footer links, compact header actions, and column controls.
- Expanded `@claim:mobile-controls` to measure every visible interactive target
  across the landing page, populated and filtered workspaces, all task dialogs,
  import recovery, Privacy, Terms, 404, and the shared footer at 390 × 844.
- Added four claim entries and real browser outcomes:
  - `grid-window` opens 1,100 rows, retains the 1,100 total, and renders 100.
  - `filtered-profile` filters the sample to 10 North rows and proves its
    profile reports 10 rows, 10 filled values, and one distinct value.
  - `analysis-limits` opens 600 groups across 25 pivot values and proves the
    500-row group cap and 20-value-column pivot cap.
  - `sql-display-limit` runs an unrestricted query over 1,100 rows and proves
    exactly 1,000 result rows are displayed.
- Updated the copy audit, README, visual-system target rule, site version to
  v1.4, and service-worker cache to `glassline-shell-v6`.
- Kept the catalog description verb-first and 69 characters, and copied it to
  `/work/.evidence/catalog-description.txt`.

## Clean-checkout verification

A separate checkout of implementation `c6b7046` was installed with `npm ci`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 127 packages; 0 audit vulnerabilities. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — TypeScript and Vite emitted `dist/`. |
| `npm run test:e2e` | PASS — 47 passed across desktop and 390 px phone; 3 intentional skips. |
| Every command in `.factory/claims.json` | PASS — all 15 commands ran separately. |
| `npm run test:claims` | PASS — 14 regular claims plus the dedicated large-file claim. |
| Large-file benchmark | PASS — 5,000,000 rows / 1,012,961,173 bytes opened and counted in 16.11 seconds. |

The three full-suite skips are the dedicated large-file test in both projects
and the desktop-only column-profile test in the phone project. Their declared
desktop commands passed. Playwright Axe checked landing, populated workspace,
Privacy, Terms, and 404 in both projects with no serious or critical findings.

Production shell budgets remain within contract: entry JavaScript is 35,332
bytes (11,702 bytes gzip), CSS is 22,400 bytes (5,640 bytes gzip), and the hero
AVIF is 77,596 bytes. DuckDB workers and WebAssembly remain deferred until a
file opens.

## Live verification

- Deployment reused the existing `sf-big-csv-browser-viewer` Static Web App in
  East US 2. Upload and managed HTTPS checks succeeded; the custom domain is
  ready and returns 200.
- The live browser suite passed 47 tests across fresh desktop and phone
  projects with the same 3 intentional skips.
- `verify-url.sh` passed: HTTPS 200, correct title and language, one h1, main,
  complete labels and alt text, and zero load errors.
- Live Lighthouse mobile scored 96 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO; FCP 0.97 s, LCP 1.42 s, TBT 237 ms, and CLS 0.
- All 29 deployment-served files match the local build byte for byte. Key
  hashes are `index.html` `62f7b601…`, entry JS `c6410cf9…`, entry CSS
  `74c20f84…`, and `sw.js` `dd3608bb…`.
- Root security headers include same-origin CSP with the WebAssembly allowance,
  HSTS, `nosniff`, denied framing, strict referrer policy, and restrictive
  permissions. Hashed assets are immutable; `sw.js` is `no-cache`.
- Home, Demo, Privacy, Terms, robots, sitemap, and manifest return 200. A fresh
  unknown URL intentionally returns the designed 404 page.

Fresh 1440 × 900 and 390 × 844 contexts showed the job, audience, and sample
action before scrolling. One click opened 40 realistic orders and 440 cells.
Filtering North produced 10 rows, and Reset restored 40. The persistent demo
label stayed visible. Start for real returned to the blank file-opening screen.
Pre-seeded localStorage, sessionStorage, IndexedDB, and OPFS markers remained
unchanged; no `demo:` key appeared. Requests stayed on the product origin, and
both contexts logged zero console or page errors.

Fresh live phone measurements include: wordmark 112.8 × 44, sortable heading
180 × 44, jump input 92 × 44, active filter 171 × 44, Clear view 82.84 × 44,
Group tab 78.72 × 44, Pivot tab 69.28 × 44, and footer Terms 44 × 44 CSS pixels.

Evidence is under `/work/.evidence/repair-8/`.

## Earlier findings

- Review 1's demo, claim inventory, audience, 404, metadata, copy, and action
  findings remain resolved.
- Review 2 F-2-1 through F-2-14 remain resolved by the current claim, route,
  copy, storage, recovery, and keyboard tests.
- Verifications 1 through 5 remain resolved: serial stability, malformed input,
  production CSP, Parquet export, the earlier 42 px toolbar, and multiline CSV
  all retain passing regressions. Verifications 6 through 8 remain applicable.
- Review 3 R3-L1 through R3-L3 remain resolved: the privacy section, demo
  footer, and literal dialog/404 wording are unchanged and tested.
- Review 4 R4-M1 is resolved by the comprehensive 390 px measurement. R4-M2 is
  resolved by four new claim tests and removal of the undefined size claim.

## Known limits

Browser memory still determines the practical file limit, and XLSX uses more
memory than delimited text. The 30-second large-file result is specific to the
documented Chromium benchmark environment. No repair finding remains.

Run future verification with:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:claims
```
