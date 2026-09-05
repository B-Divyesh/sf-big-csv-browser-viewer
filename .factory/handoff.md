# Repair handoff — big-csv-browser-viewer-repair-7

Date: September 5, 2026

Implementation SHA: `4ee27d9939db87bf3f013477090ef9d288c72eda`

Live URL: <https://big-csv-browser-viewer.sociobot.in>

## Result

All three strict-review findings are repaired and deployed. The landing page
now has a separate privacy and limits section. `/demo` keeps the standard
footer below its full-height data viewer. Dialogs, legal pages, and the 404 use
literal task labels with no metaphorical secondary headings.

The free, local-first product scope is unchanged. There is no backend, account,
payment, cloud save, or collaboration service.

## Changes

- Added a responsive three-part **Privacy and limits** section after the task
  steps, covering tab lifetime, the public sample cache, unavailable cloud
  features, and browser memory limits.
- Kept the complete Privacy, Terms, Param Factory, and version footer in the
  document flow for demo and real-file workspaces without reducing the viewer's
  viewport-height work area.
- Replaced the 404 metaphor with **Page not found** and direct recovery links.
- Removed decorative dialog and legal-page labels. Each dialog now has one
  literal accessible heading: Filter rows, Group and pivot, Query with SQL,
  Export this view, or the relevant import error.
- Added browser regressions for the section's user-visible guidance and order,
  its working privacy link, the exact `/demo` footer, and single literal dialog
  headings.
- Expanded the real-file privacy claim test to require GET-only same-origin
  requests and no WebSocket connection during open and export.
- Hid legal-route live announcements visually while retaining their polite
  screen-reader updates.
- Updated `.factory/claims.json`, `.factory/copy-audit.md`, `.factory/demo.md`,
  `.factory/design.md`, route versions, and the service-worker cache version.

## Clean-checkout verification

A fresh clone of the pushed implementation was created at
`4ee27d9939db87bf3f013477090ef9d288c72eda` and verified from `npm ci`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 127 packages, 0 audit vulnerabilities. |
| `npm test` | PASS — 9/9 unit tests. |
| `npm run build` | PASS — TypeScript and Vite emitted `dist/`. |
| `npm run test:e2e` | PASS — 40 passed across desktop and 390 px phone; the 2 dedicated large cases skipped by design. |
| Every command in `.factory/claims.json` | PASS — all 11 commands were run separately. |
| `npm run test:claims` | PASS — 10 regular claims passed, then the dedicated large-file claim passed. |
| 5M-row benchmark | PASS — 5,000,000 rows / 1,012,961,173 bytes opened and counted in 16.25 seconds. |

Each claim ID still occurs once in the browser suite. The passing claims cover
the demo sandbox, same-origin local processing, offline reload, the complete
workflow, CSV and Parquet exports, supported formats, mobile controls,
real-file storage, import recovery, and the 5-million-row limit.

Initial production assets remain inside budget: entry JavaScript is 35,334
bytes (11.78 kB gzip), CSS is 22,181 bytes (5.62 kB gzip), and the hero AVIF is
77,596 bytes. DuckDB workers and WASM remain deferred until a file opens.

## Live verification

- The existing `sf-big-csv-browser-viewer` Static Web App in East US 2 was
  reused. The production upload completed successfully, the custom domain
  remained ready, and HTTPS returned 200.
- Live `npm run test:e2e`: PASS — 40 passed, 2 dedicated large cases skipped,
  zero failed across desktop and 390 px phone.
- `verify-url.sh`: PASS — HTTPS 200, correct title and language, one h1, main,
  complete image/button labels, and zero console errors.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  and 100 SEO; LCP 1.43 s, FCP 0.98 s, TBT 76 ms, CLS 0.
- Playwright Axe checked landing, populated workspace, Privacy, Terms, and 404
  in both projects with zero serious or critical findings.
- All 29 public build files matched the live response byte-for-byte. Key hashes:
  `index.html` `ee485972…`, entry JS `9208f6de…`, entry CSS `db30725e…`.
- Root CSP, HSTS, `nosniff`, denied framing, referrer policy, and permissions
  policy are present. Hashed assets are immutable for one year; `sw.js` is
  `no-cache` and uses `glassline-shell-v5`.
- Every collected home, demo, legal, 404, sitemap, manifest, and Param Factory
  link returned 200. A deliberately unknown route returned the expected 404
  with **Page not found**, a home link, sample link, and only same-origin assets.

Fresh 1440 × 900 and 390 × 844 contexts showed the job, audience, and sample
action before scrolling. One click opened 40 realistic orders and 440 populated
grid cells. Filtering North produced 10 rows; Reset demo restored 40. The
banner and footer stayed available. Start for real returned to the blank file
screen. Pre-seeded localStorage, sessionStorage, IndexedDB, and OPFS values were
unchanged, no `demo:` keys appeared, all requests stayed on this origin, and
both contexts logged zero page or console errors. Phone document width stayed
390 px.

Evidence is under `/work/.evidence/repair-7/`, including cold and demo desktop
and phone screenshots, `verify.json`, and the Lighthouse JSON report. The
verb-first, 69-byte catalog description was copied to
`/work/.evidence/catalog-description.txt`.

## Earlier findings

- Review 1's demo, claim inventory, audience, 404, metadata, copy, and picker
  findings remain resolved.
- Review 2 F-2-1 through F-2-14 remain resolved by the current claims, route,
  copy, and keyboard tests.
- Verification 1's serial-run and malformed-input issues, verification 2's
  production CSP issue, verification 3's Parquet issue, verification 4's phone
  target issue, and verification 5's multiline CSV issue all retain passing
  local and live regressions. Verifications 6 and 7 remain applicable.
- Review 3 R3-L1, R3-L2, and R3-L3 are resolved by the deployed structure,
  wording, and outcome-based browser checks described above.

The work order referenced `/work/.evidence/qa-report.md` and `qa-result.json`,
but neither file was present in this worker. The committed handoff, all three
reviews, and all seven verification reports were read before changes.

## Known limits and next steps

No repair finding remains. Browser memory still determines the practical file
limit, and XLSX uses more memory than delimited text. The 30-second large-file
result is specific to the documented Chromium benchmark environment.

Run future verification with:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:claims
```

## Verification 8 handoff

Date: September 5, 2026

Independent QA reviewed implementation `4ee27d9939db87bf3f013477090ef9d288c72eda`
and documentation `81e81088eb435e5c1bb0b2575bde159e394c7233`. It made no
product-code changes. The live product and clean checkout passed: `npm ci`,
9/9 unit tests, build, local and live browser suites (40 passed; two dedicated
large-file instances skipped by design), all 11 claim commands separately, and
the one-gigabyte five-million-row claim in 18.8 seconds. Fresh desktop and
phone sample checks confirmed the clear first screen, populated 40-row viewer,
persistent demo label, reset, and blank real-data exit without web storage
changes. Live Lighthouse was 100/100/100/100.

The verification verdict is **PASS** with zero findings and zero untested
claims. The detailed report is `.factory/verification-8.md`; external evidence
is `/work/.evidence/verify-8/`, with the required summary at
`/work/.evidence/qa-report.md`.
