# Open large CSV files locally — verification 9

**Verdict: PASS**

Verified September 6, 2026 against <https://big-csv-browser-viewer.sociobot.in>.
There are **zero findings of every severity** and **zero untested public claims**.

Implementation reviewed: `c6b7046e223c1a5bcaca7c9a31d149f2e2d47b75`

Documentation reviewed: `a9bd038686f9ba2539348d44a4668532c96bd785`

The documentation commit changes only `.factory/copy-audit.md` and
`.factory/handoff.md`. A fresh build has 29 served files, and every file matches
production byte for byte.

## Job, audience, and first action

Fresh live Chromium contexts were opened at 1440 × 900 and 390 × 844 before
scrolling. Both showed:

- Job: **Open 5-million-row CSV files in your browser.**
- Audience: analysts with files a spreadsheet app cannot open who need to find
  and export selected rows.
- First action: **Try it with sample data**. The adjacent text says it opens 40
  sample orders in the full CSV viewer.

The three short facts also appeared on the first screen: the file stays in the
tab, the sample works offline after the first visit, and the product is free.
The phone document stayed 390 px wide. Evidence:
`/work/.evidence/verify-9/desktop-first-screen.png` and
`/work/.evidence/verify-9/phone-first-screen.png`.

## One-click sample and real-data separation

In separate fresh desktop and phone contexts, one click opened
`sample-orders.csv` with 40 rows and 440 populated cells. The persistent label
read **Demo — sample data, nothing is saved** and provided **Reset demo** and
**Start for real**.

Filtering to North produced 10 rows. Reset restored 40 rows. Starting for real
returned to the blank file-opening screen. Before entering the demo, each
context received distinct markers in localStorage, sessionStorage, IndexedDB,
and OPFS. All markers were unchanged after filtering, reset, and exit. No
`demo:` key appeared. Both contexts recorded zero console or page errors.

## Clean-checkout and browser gates

The checkout was clean at documentation SHA `a9bd038` before report work.
Node 22 satisfies the documented Node 20-or-newer prerequisite.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 127 packages installed; 0 audit vulnerabilities. |
| `npm test` | PASS — 9/9 tests. |
| `npm run build` | PASS — TypeScript and Vite emitted `dist/index.html`. |
| Every command in `.factory/claims.json` | PASS — all 15 commands ran separately. |
| `npm run test:claims` | PASS — 14 regular claims passed; the dedicated large case then passed separately. |
| `npm run test:e2e` | PASS — 47 passed, 3 intentional skips, 0 failed. |
| Live `npm run test:e2e` | PASS — 47 passed, 3 intentional skips, 0 failed. |
| `verify-url.sh` | PASS — HTTP 200, title, `lang`, one h1, main, labels and alt text present, zero load errors. |
| Live Lighthouse mobile | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 50 ms, CLS 0. |

The three full-suite skips are intentional: the large-file claim has its own
declared desktop command in both projects, and column profiling uses the
desktop column panel. Both declared desktop commands passed.

The production shell stays within budget. Entry JavaScript is 35,332 bytes
(11.78 KB gzip), CSS is 22,400 bytes (5.64 KB gzip), and the hero AVIF is
77,596 bytes. DuckDB, XLSX parsing, and WebAssembly remain deferred until a
file is opened.

## Declared claims

Each of the 15 IDs occurs exactly once in `tests/app.spec.ts`. Every exact
command from `.factory/claims.json` passed independently.

| Claim | Result and observed outcome |
| --- | --- |
| `demo-sandbox` | PASS — 40 orders, 10-row mutation, 40-row reset, no account or workspace storage, blank real exit. |
| `local-processing` | PASS — filter, summary, SQL, and export requests stayed on the product origin. |
| `offline-reload` | PASS — the 40-row sample reopened offline after the first completed visit. |
| `core-workflow` | PASS — sort, filter, profile, group, pivot, invalid/read-only SQL, and recovery produced the expected results. |
| `csv-export` | PASS — the original header and all 10 filtered North rows downloaded. |
| `parquet-export` | PASS — valid Parquet metadata contained 10 rows, 11 typed fields, and one row group. |
| `supported-file-formats` | PASS — CSV, TSV, TXT, and the first XLSX worksheet opened. |
| `mobile-controls` | PASS — every visible action on landing, workspace, dialogs, legal pages, 404, and footer measured at least 44 × 44 CSS px at 390 px; shortcuts worked. |
| `real-file-storage` | PASS — a marked selected file and export were absent from browser stores; only same-origin GETs occurred; refresh and close cleared the workspace. |
| `import-recovery` | PASS — a separator mismatch reopened as two correct rows after the selected-separator retry. |
| `grid-window` | PASS — 1,100 rows remained the total while exactly 100 data rows rendered. |
| `filtered-profile` | PASS — the North profile reported 10 rows, 10 filled values, and one distinct value. |
| `analysis-limits` | PASS — 600 groups stopped at 500 output rows and 25 pivot values stopped at 20 value columns. |
| `sql-display-limit` | PASS — an unrestricted 1,100-row query displayed exactly 1,000 rows. |
| `large-file` | PASS — the generated file exceeded 1 GB, contained 5,000,000 rows, and passed the asserted under-30-second open-and-count limit. |

The live landing page, workspace, dialogs, Privacy, Terms, 404, metadata,
manifest, README, and copy audit were cross-checked against this inventory.
No missing, false, incomplete, or untested public claim remains.

## Normal, invalid, boundary, and recovery paths

- Normal sample and user-selected CSV paths, TSV, TXT, first-sheet XLSX,
  filtering, sort, profile, group, pivot, SQL, and both exports pass locally
  and live.
- A valid three-row CSV containing `0`, `-5`, `500`, and a quoted multiline
  field opened. Filtering `amount` to at most zero returned two rows.
- Empty and header-only CSV files reached stable 0-row workspaces. A one-row
  file reported one row.
- LF and CRLF quoted multiline CSV pass. Unterminated quoted input opens the
  import-recovery dialog. Unsupported JSON reports the supported formats.
- Separator retry succeeds. A forced local-engine failure explains that
  nothing was uploaded and offers retry. Modifying SQL is rejected, after
  which a read-only query succeeds.
- The grid, profile, group, pivot, SQL, and 5-million-row boundaries all pass
  their outcome assertions.

There is no backend, account, tenant, payment, server database, or persistent
product service. Tenant isolation, restart persistence, health, and 429 checks
do not apply.

## Accessibility, privacy, offline use, and routes

- Playwright Axe checked landing, populated workspace, Privacy, Terms, and 404
  in desktop and phone projects. It found no serious or critical violations.
- Each route has `lang="en"`, one h1, a main landmark, route title, shared
  navigation, footer, and focused heading. The skip link displays a 3 px mint
  focus outline. Native dialogs contain focus and return it to the invoking
  button or the shortcut's prior focus. `/`, `g`, `e`, Enter, Space, Escape,
  Back, and Forward paths pass.
- At 390 px, all visible interactive targets pass 44 × 44 px measurement and
  the document has no horizontal overflow. At 200% browser zoom, content and
  actions remain present and scrollable. Reduced motion changes transitions to
  an effectively immediate `1e-05s`.
- Fresh request and storage probes support the local-processing claims. There
  is no analytics, tracker, CDN script, or remote font in the runtime.
- A live service-worker update completed with an activated controller, scope
  `/`, and only `glassline-shell-v6`. The sample then reloaded offline with all
  40 rows.
- `/`, `/demo`, `/privacy/`, `/terms/`, robots, sitemap, and manifest return
  200. Collected real destinations, including Sociobot, return 200. A fresh
  unknown URL deliberately returns HTTP 404 with title **Page not found —
  Glassline**, one focused h1, shared chrome, and working recovery links. That
  expected 404 is not a defect.
- Live responses include HSTS, same-origin CSP with the required narrow
  WebAssembly allowance, `nosniff`, denied framing, strict referrer policy,
  and restrictive permissions. `sw.js` is `no-cache`; hashed assets are
  immutable.

## Earlier findings disposition

| Earlier finding | Fresh disposition |
| --- | --- |
| Review 1 — missing sample demo and sandbox | Resolved: one-click sample, persistent label, reset, exit, storage isolation, and offline use pass. |
| Review 1 — missing claim inventory | Resolved: 15 claims exist once each and every declared command passed separately. |
| Review 1 — audience absent | Resolved: analysts and their spreadsheet-limit situation are above the fold on phone and desktop. |
| Review 1 — generic Azure 404 | Resolved: the live unknown route is the designed Glassline 404 with recovery links. |
| Review 1 — untested/jargon-heavy copy | Resolved: current copy audit has no over-22-word, banned-word, mood-heading, or unexplained visitor-copy flags. |
| Review 1 — metadata and route skeleton incomplete | Resolved: metadata, social art, touch icon, sitemap, shared chrome, focus, and route titles pass. |
| Review 1 minor — vague buttons and headings | Resolved: visible actions and section/dialog headings name their result or task. |
| Review 2 F-2-1 — large-file claim absent | Resolved: `large-file` is declared once and its 5M-row/about-1-GB/under-30-second assertion passes. |
| Review 2 F-2-2 — storage/privacy claims exceed tests | Resolved: `local-processing` and `real-file-storage` cover requests, stores, refresh, and tab close. |
| Review 2 F-2-3 — recovery claim absent | Resolved: `import-recovery` proves selected-separator retry and states the UTF-8 boundary. |
| Review 2 F-2-4 — deployment sentence unlisted | Resolved: the unlisted README sentence was removed; route/header behavior is still verified here. |
| Review 2 F-2-5 — incomplete route focus | Resolved: Home, Demo, Back, Forward, Privacy, Terms, and 404 focus/announcement checks pass. |
| Review 2 F-2-6 minor — “real workspace” ambiguity | Resolved: the text says **full CSV viewer** and **Start for real**. |
| Review 2 F-2-7 minor — “export” used for input and output | Resolved: imported data is consistently a file; export means the downloaded result. |
| Review 2 F-2-8 minor — file action excluded formats | Resolved: **Open a data file** accompanies CSV, TSV, TXT, and XLSX. |
| Review 2 F-2-9 minor — protocol jargon | Resolved: privacy text says requests stay on this site. |
| Review 2 F-2-10 minor — internal QA jargon | Resolved: README says **product promise**. |
| Review 2 F-2-11 minor — “fixture” jargon | Resolved: README says **test file**. |
| Review 2 F-2-12 minor — dense deployment sentence | Resolved: the sentence was removed. |
| Review 2 F-2-13 minor — parser jargon | Resolved: README tells the user to choose the file's separator and retry. |
| Review 2 F-2-14 minor — duplicate picker stop | Resolved: the full picker has one keyboard stop. |
| Verification 1 — parallel browser crashes | Resolved: Playwright is configured for one worker; local and live 47-test matrices pass. |
| Verification 1 — malformed quotes accepted | Resolved: unterminated quotes show specific import recovery and keep the workspace hidden. |
| Verification 2 — production CSP blocked DuckDB-WASM | Resolved: live CSV/TSV/TXT/XLSX and query/export paths pass under the production CSP. |
| Verification 3 — Parquet export failed | Resolved: the downloaded filtered Parquet file is parsed and validated. |
| Verification 4 — 42 px phone toolbar controls | Resolved: all visible phone targets, including the toolbar, pass at least 44 px. |
| Verification 5 — valid multiline CSV rejected | Resolved: LF and CRLF multiline fixtures open locally and live. |
| Verifications 6, 7, and 8 — no findings | Retained and independently reconfirmed against the current implementation. |
| Review 3 R3-L1 — missing privacy/limits section | Resolved: the section follows the three task steps. |
| Review 3 R3-L2 — demo footer hidden | Resolved: `/demo` exposes the complete standard footer. |
| Review 3 R3-L3 — metaphorical dialog/404 labels | Resolved: dialog and 404 headings are literal task/status text. |
| Review 4 R4-M1 — additional phone targets below 44 px | Resolved: the expanded regression measures landing, grid headings, chips, tabs, dialogs, legal pages, 404, and footer. |
| Review 4 R4-M2 — five workspace claims untested | Resolved: four outcome claims cover the grid/profile/group/pivot/SQL caps; the undefined Parquet size comparison is gone. |

## Missed leverage and scope

No feature finding remains. Import, local analysis, filtered CSV/Parquet
export, offline sample use, and recovery cover the brief. Sync would conflict
with the local-only design. An AI step would add no clear value to this
deterministic file-analysis job.

## Final counts and evidence

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Total findings: 0
- Untested public claims: 0
- **Verdict: PASS**

Evidence is under `/work/.evidence/verify-9/`. This report is also copied to
`/work/.evidence/qa-report.md`.
