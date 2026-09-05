# Open large CSV files locally — review 4

**Verdict: FAIL**

Review date: September 5, 2026

Live URL: <https://big-csv-browser-viewer.sociobot.in>

Implementation reviewed: `4ee27d9939db87bf3f013477090ef9d288c72eda`
Documentation reviewed: `3572325989d5149b5327b016df16434c4866fd80`

There are **2 findings**, both medium severity. There are **6 public claims
without adequate automated proof**: one declared mobile claim is narrower in
its test than in its wording, and five visible workspace statements are absent
from `.factory/claims.json`. The zero-finding and zero-untested-claim acceptance
rule therefore makes this review a **FAIL**. No product code was changed.

## Job, audience, and first action

Fresh 1440 × 900 desktop and 390 × 844 phone contexts were opened at the live
root before scrolling.

- Job: **Open 5-million-row CSV files in your browser.**
- Audience: analysts with files a spreadsheet app cannot open who need to find
  and export rows.
- First action: **Try it with sample data**. The adjacent text says it opens 40
  sample orders in the full CSV viewer.

The job, audience, first action, result, and three facts were visible without
scrolling in both contexts. The phone document stayed 390 px wide.

## Demo and real-data separation

One click opened `sample-orders.csv` with 40 rows, 440 populated cells, 11 data
columns, realistic customers, regions, dates, statuses, revenue, cost, and
owners. The label **Demo — sample data, nothing is saved** stayed available
with **Reset demo** and **Start for real**.

Filtering North produced 10 rows. Reset restored all 40 rows. Starting for real
returned to the blank file-opening screen. Before entering the demo, the review
placed distinct markers in localStorage, sessionStorage, IndexedDB, and OPFS.
All four markers were unchanged after reset and after leaving the demo, and no
`demo:` key appeared. Both fresh contexts recorded zero unexpected console or
page errors.

## Findings

### R4-M1 — Medium — Several phone controls are smaller than the required 44 px target

The live 390 px workspace has controls below the non-negotiable 44 × 44 px
touch target:

| Control | Live size |
| --- | ---: |
| Sortable column headings | 180 × 40 px |
| Active filter chip | 167 × 32 px |
| Clear view | 78.8 × 32 px |
| Group tab | about 77.5 × 36 px |
| Pivot tab | about 68.2 × 36 px |

The home wordmark is 24 px high, and the phone footer links are about 19.5 px
high. These are also below the supplied accessibility baseline. The current
`mobile-controls` claim says workspace actions meet 44 px targets, but its test
measures only Filter, Group and pivot, SQL, and Export in the top toolbar. It
does not inspect sorting, applied-filter controls, dialog tabs, or route links.

This is a real mobile accessibility defect and an incompletely tested public
claim. Increase every interactive target to at least 44 × 44 CSS px, then make
the claim test enumerate every visible interactive control in the landing,
workspace, filtered state, dialogs, legal pages, and footer.

### R4-M2 — Medium — Five visible workspace claims are missing from the claim inventory

The following statements are visible after opening a file but have no matching
entry in `.factory/claims.json` and no claim-tagged outcome test:

1. **Showing up to 100 rows.**
2. **Calculated across the current filtered view.**
3. **Results are capped at 500 rows and 20 pivot columns.**
4. **Display is capped at 1,000 rows.**
5. Parquet is described as **Smaller, typed data**; the typed-data claim is
   listed, but the comparative size claim is not.

A separate live boundary probe found the implementation currently behaves as
described: a 1,100-row file rendered 100 data rows plus its header; a 100-row
filtered profile reported 100 filled rows with minimum 1001 and maximum 1100;
group output stopped at 500 rows; a 25-value pivot produced 20 value columns;
and SQL displayed 1,000 rows. For the 40-row sample, CSV was 3,649 bytes and
Parquet was 3,287 bytes. These one-off observations do not satisfy the contract
that every public claim be inventoried and run on every build.

Add the statements to the claim inventory and assert the observable results,
or remove them. The Parquet comparison needs a defined dataset and comparison;
otherwise replace **Smaller** with a non-comparative description.

## Clean-checkout verification

A separate checkout of the implementation candidate was installed and tested.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 127 packages installed; 0 audit vulnerabilities. |
| `npm test` | PASS — 9/9 tests. |
| `npm run build` | PASS — TypeScript and Vite emitted `dist/`. |
| Local `npm run test:e2e` | PASS — 40 passed, 2 dedicated-large cases skipped, 0 failed. |
| Live `npm run test:e2e` | PASS — 40 passed, 2 dedicated-large cases skipped, 0 failed. |
| Every command in `.factory/claims.json` | PASS — all 11 commands were run separately. |
| Fresh large-file command | PASS — generated 5,000,000 rows and 1,012,961,173 bytes, then passed its internal under-30-second open-and-count assertion. |
| `verify-url.sh` | PASS — HTTP 200, correct title and language, one h1, main, complete labels and alt text, zero load errors. |
| Live Lighthouse mobile | PASS — 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.42 s, TBT 135 ms, CLS 0. |

The entry JavaScript is 35.33 kB uncompressed and 11.78 kB gzip. CSS is
22.18 kB uncompressed and 5.62 kB gzip. The original hero AVIF is 77,596
bytes. DuckDB workers and WebAssembly remain deferred until a file opens.

All 29 deployment-served build files matched the live responses byte for byte.
`staticwebapp.config.json` is the thirtieth build file and correctly returns 404
because Azure consumes it as deployment configuration rather than serving it.
Thus the live runtime matches implementation `4ee27d9`.

## Declared claims

Every declared command passed from the clean checkout, and each claim ID occurs
once in `tests/app.spec.ts`.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — 40 orders, reset, blank real exit, no account or local/session workspace state. |
| `local-processing` | PASS — filter, summary, SQL, and export requests stayed on the product origin. |
| `offline-reload` | PASS — the sample reopened offline after the first completed visit. |
| `core-workflow` | PASS — filter, sort state, profile panel, group, pivot, and read-only SQL paths completed. |
| `csv-export` | PASS — original header and 10 North rows downloaded. |
| `parquet-export` | PASS — valid Parquet metadata had 10 rows, 11 fields, and one row group. |
| `supported-file-formats` | PASS — CSV, TSV, TXT, and first-sheet XLSX fixtures opened. |
| `mobile-controls` | INCOMPLETE — the four toolbar buttons pass, but R4-M1 shows other workspace actions below 44 px. |
| `real-file-storage` | PASS — marked real data was absent from browser stores, requests were same-origin GETs, and refresh/close cleared the workspace. |
| `import-recovery` | PASS — a separator mismatch reopened as two rows after retry. |
| `large-file` | PASS — the generated file exceeded 1 GB and met the asserted 30-second limit. |

The passing commands do not cure R4-M1 or the five missing claims in R4-M2.

## Normal, invalid, boundary, and recovery paths

The local and live suites passed normal CSV, TSV, TXT, and first-sheet XLSX;
LF and CRLF quoted multiline CSV; numeric filtering; column profiling; group;
pivot; read-only SQL and rejected write SQL; CSV and Parquet export; malformed
quotes; separator retry; and forced local-engine startup failure with retry
guidance. The independent 1,100-row probe confirmed the current grid, profile,
group, pivot, and SQL limits described in R4-M2.

There is no backend, account, tenant, payment, or server-held product state, so
tenant isolation, restart persistence, health, and 429 checks do not apply.

## Accessibility, privacy, offline use, and routes

- Playwright Axe ran on the landing page, populated workspace, Privacy, Terms,
  and 404 in both desktop and phone projects with no serious or critical axe
  violations. R4-M1 remains because the supplied 44 px rule is stricter than
  the automated axe result.
- Keyboard shortcuts `/`, `g`, and `e`, dialog Escape behavior, route focus,
  focus return, and polite route announcements passed. Focus styling is a 3 px
  mint outline.
- Reduced motion changed transitions to `0.01ms` and smooth scrolling to
  `auto`. There is no flashing or autoplay.
- A fresh service-worker update retained an active controller and only the
  `glassline-shell-v5` cache. The 40-row sample then reloaded offline.
- `/`, `/?demo=1`, `/demo`, `/privacy/`, `/terms/`, `robots.txt`,
  `sitemap.xml`, and the manifest returned 200. Titles and one-h1 structure
  passed. An unknown URL deliberately returned HTTP 404 with **Page not found**,
  focused its h1, offered home and sample links, and loaded only product-origin
  assets. The expected 404 network entry is not a defect.
- Live responses include a same-origin Content Security Policy with the needed
  WebAssembly allowance, HSTS, `nosniff`, denied framing, restrictive
  permissions, and a strict referrer policy. Versioned assets are immutable;
  `sw.js` is `no-cache`.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Review 1: missing demo, claim inventory, audience, designed 404, metadata, copy, and clear actions | The cited defects remain resolved in the current live product. |
| Review 2 F-2-1 through F-2-4: large-file, storage, recovery, and deployment claims | The cited claims remain declared and their commands pass. R4-M2 concerns different visible workspace statements. |
| Review 2 F-2-5: route focus | Resolved; home, demo, legal, and 404 focus and announcements pass. |
| Review 2 F-2-6 through F-2-14: wording, formats, privacy language, and duplicate picker stop | Resolved in current copy and browser behavior. |
| Verification 1: serial stability and malformed input | Resolved; one worker is configured and malformed input has visible recovery. |
| Verification 2: production CSP blocked DuckDB-WASM | Resolved; live imports and queries complete without CSP errors. |
| Verification 3: Parquet download failed | Resolved; a valid filtered Parquet file downloads and parses. |
| Verification 4: 42 px top-toolbar controls | The four cited toolbar controls are now 44 px. R4-M1 finds other undersized controls that the current regression omits. |
| Verification 5: valid multiline CSV rejected | Resolved; both LF and CRLF multiline fixtures pass locally and live. |
| Verifications 6 through 8: no functional defects at their tested scope | Core behavior remains passing; R4-M1 and R4-M2 arise from the fresh broader target and claim audit. |
| Review 3 R3-L1: missing privacy and limits section | Resolved; the section follows the task steps. |
| Review 3 R3-L2: demo hid the footer | Resolved; the demo footer is present after the full-height viewer. |
| Review 3 R3-L3: decorative dialog and 404 labels | Resolved; current headings name the task or status directly. |

## Missed leverage

No feature finding. Import, filter, profile, group, pivot, SQL, and export cover
the brief. Sync would conflict with local processing. An AI feature would not
improve this deterministic local workflow.

## Evidence

Evidence is under `/work/.evidence/review-4/`, including fresh desktop and
phone first-screen and demo captures, individual claim logs, the URL smoke
result, and Lighthouse JSON. This report is copied to
`/work/.evidence/qa-report.md`.
