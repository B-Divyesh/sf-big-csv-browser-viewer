# Open large CSV files locally — review 5

**Verdict: PASS**

Review date: September 6, 2026
Live URL: <https://big-csv-browser-viewer.sociobot.in>

Implementation reviewed: `c6b7046e223c1a5bcaca7c9a31d149f2e2d47b75`
Documentation reviewed: `b2598c38ce39ef69f3fb14162ea913bd3ae54a9a`

`b2598c3` changes only factory documentation (`copy-audit`, handoff, and the
previous verification report). The live runtime matches the implementation
candidate: all 29 served build files matched byte for byte. Azure consumes
`staticwebapp.config.json`, so its expected HTTP 404 is not a mismatch.

There are **zero findings of every severity** and **zero untested public
claims**.

## Job, audience, and first action

Fresh live Chromium contexts at 1440 × 900 and 390 × 844 were opened at the
root before scrolling. Both showed:

- Job: **Open 5-million-row CSV files in your browser.**
- Audience: analysts with files a spreadsheet app cannot open who need to find
  and export selected rows.
- First action: **Try it with sample data**. It says that it opens 40 sample
  orders in the full CSV viewer.

The primary action was visible without scrolling in both contexts. The phone
document was exactly 390 px wide. Screenshots are in
`/work/.evidence/review-5/desktop-first-screen.png` and
`/work/.evidence/review-5/phone-first-screen.png`.

## Demo and data separation

One click opened the realistic `sample-orders.csv` workspace with 40 rows and
440 populated cells on desktop and phone. The visible banner read **Demo —
sample data, nothing is saved** and offered **Reset demo** and **Start for
real**.

Filtering `region` to North produced 10 rows. Reset restored 40 rows. Start
for real returned to the blank file-opening workspace. Distinct localStorage
and sessionStorage markers placed before demo entry were unchanged through
filtering, reset, and exit. The full declared claim additionally checks
IndexedDB and OPFS. No console or page errors occurred in either fresh live
context. The detailed records are
`/work/.evidence/review-5/live-flow.json` and
`/work/.evidence/review-5/live-demo-flow.json`.

## Clean checkout and declared claims

This clean checkout used Node `v22.23.2`, which satisfies the documented Node
20-or-newer requirement. `npm ci` installed 127 packages with zero audit
vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 9 tests passed. |
| `npm run build` | PASS — TypeScript and Vite emitted `dist/`. |
| `npm run test:e2e` | PASS — 47 passed, 3 intentional dedicated-case skips. |
| Every exact command in `.factory/claims.json`, run separately | PASS — all 15 passed. |
| `npm run test:claims` | PASS — 14 regular claims passed, its intentional dedicated large-file skip occurred, then the dedicated large-file claim passed. |
| `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e` | PASS — 47 passed, 3 intentional dedicated-case skips. |
| `/opt/fleet/lib/verify-url.sh` against live | PASS — HTTP 200, title, language, h1, main, image alt text, labels, and zero load errors. |

The independent claim logs are in
`/work/.evidence/review-5/claims/`; `claim-results.txt` records a zero exit
status for every ID. The large-file command generated its file outside the
repository, verified 1,012,961,173 bytes and 5,000,000 rows, and passed its
under-30-second browser assertion in 29.2 seconds.

All 15 public claims have exactly one corresponding claim-tagged browser test
and passed their declared command: demo sandbox, local processing, offline
reload, core workflow, CSV export, Parquet export, supported file formats,
mobile controls, real-file storage, import recovery, grid window, filtered
profile, analysis limits, SQL display limit, and large file. No public
claim-like copy was found outside this inventory.

## Product paths and quality checks

The local and live browser matrices cover normal CSV, TSV, TXT, and first-sheet
XLSX import; sorting, filtering, profiles, group, pivot, read-only SQL, and
CSV/Parquet export; empty, header-only, one-row, UTF-8, LF/CRLF multiline,
numeric-boundary, unsupported-format, malformed-quote, separator-retry, and
forced-local-engine-failure paths. They also assert the 100-row grid window,
500-row group limit, 20-column pivot limit, 1,000-row SQL limit, focus return,
back/forward, keyboard shortcuts, 390 px targets, 200% zoom, reduced motion,
and serious/critical Axe results across landing, workspace, legal pages, and
the recovery page.

The live route, link, and security checks passed:

- `/`, `/demo`, `/privacy/`, `/terms/`, robots, sitemap, and manifest return
  200; all collected internal destinations and the Param Factory destination
  return 200.
- An unknown URL deliberately returns a designed HTTP 404 with one h1, a route
  title, common navigation, and recovery links. This expected 404 is not a
  defect.
- The service worker and offline-demo claim passed in the clean browser test.
  There is no account, backend, tenant, database, payment flow, or server-held
  product state; tenant isolation, restart persistence, health, and 429 checks
  do not apply.
- Live headers include HSTS, `nosniff`, denied framing, a strict referrer
  policy, restrictive permissions, and a same-origin CSP with the necessary
  WebAssembly allowance. No tracker, remote font, or third-party script was
  observed.

A fresh mobile Lighthouse run scored 97 Performance, 100 Accessibility, 100
Best Practices, and 100 SEO (FCP 1.0 s, LCP 1.4 s, TBT 190 ms, CLS 0). The
performance score varies with the controlled test environment but exceeds the
required budget. The report is
`/work/.evidence/review-5/lighthouse-mobile.json`.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1: demo, sandbox, claim inventory, audience, designed 404, metadata, and clear actions | Resolved and reconfirmed by fresh desktop/phone demo, route, claim, and metadata checks. |
| Review 1 minor: vague actions/headings and copy problems | Resolved; the current audited copy uses literal task headings and result-naming actions. |
| Review 2 F-2-1 through F-2-5: large-file, privacy/storage, recovery, deployment-copy, and route-focus gaps | Resolved; the respective claims, real runtime paths, parity check, and focus/announcement tests pass. |
| Review 2 F-2-6 through F-2-14: real-workspace wording, import/export terms, formats, protocol/QA/parser jargon, and picker-stop issues | Resolved; the current copy audit and keyboard test cover all cited points. |
| Verification 1: parallel instability and malformed quotes | Resolved; the suite is serial and malformed input has tested recovery. |
| Verification 2: production CSP prevented DuckDB-WASM | Resolved; live imports, analysis, and exports pass without CSP errors. |
| Verification 3: Parquet export | Resolved; the filtered Parquet file is downloaded and parsed by the claim test. |
| Verification 4: undersized phone controls | Resolved; the exhaustive 390 px control measurement claim passes. |
| Verification 5: valid multiline CSV | Resolved; LF and CRLF multiline files pass locally and live. |
| Verifications 6, 7, 8, and 9 | No findings; their covered behavior was independently reconfirmed. |
| Review 3: privacy/limits placement, hidden demo footer, decorative dialog/404 wording | Resolved; current layout and literal headings pass. |
| Review 4: additional undersized phone targets and unlisted workspace claims | Resolved; all visible targets pass and the grid/profile/group/pivot/SQL limits are separately claimed and tested. |

## Final result

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Total findings: 0
- Untested public claims: 0

**Verdict: PASS**

Evidence is under `/work/.evidence/review-5/`. This report is copied to
`/work/.evidence/qa-report.md`.
