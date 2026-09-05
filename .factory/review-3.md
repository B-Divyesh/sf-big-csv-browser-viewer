# Open large CSV files locally — strict review 3

**Verdict: FAIL**

Review date: September 5, 2026

Live URL: <https://big-csv-browser-viewer.sociobot.in>

Implementation candidate: `69cd22503c55af9c162385ea380bae53dffbd23c`

Reviewed documentation base: `4ecfe217cd5af1d89bd1736e05f1f307b135f38a`

There are **3 findings**: zero critical, zero high, zero medium, and three low.
There are **0 untested public claims**. The zero-finding acceptance rule makes
the product a FAIL even though every functional and claim test passed.

## Job, audience, and first action

Fresh live Chromium contexts were opened at 1440 × 900 and 390 × 844 before
scrolling. Both clearly showed:

- Job: **“Open 5-million-row CSV files in your browser.”**
- Audience: **“For analysts with files a spreadsheet app cannot open…”**
- First action: **“Try it with sample data”**, followed by **“Opens 40 sample
  orders in the full CSV viewer.”**

The first-screen title names the job, the phone width stayed at 390 px, and
neither context logged a console or page error.

## One-click sample and real-data separation

One click opened `sample-orders.csv` in the real workspace with 40 rows and
440 rendered grid cells. The persistent label read **“Demo — sample data,
nothing is saved”** and exposed **Reset demo** and **Start for real**.

Filtering North reduced the sample to 10 rows. Reset restored all 40 rows.
Start for real returned to `/` with no workspace or sample banner. Local and
session storage were empty before and after reset and after exit. The complete
demo flow made requests only to the product origin. This proves the sample did
not alter a real workspace or browser-stored user data.

## Clean-checkout gates

The repository was cloned without local dependencies at documentation SHA
`4ecfe217cd5af1d89bd1736e05f1f307b135f38a`. The only changes from the
implementation candidate are report files.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 127 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS — 9/9 tests. |
| `npm run build` | PASS — TypeScript and Vite completed; `dist/` exists. |
| Local `npm run test:e2e` | PASS — 36 passed, 2 dedicated large-file cases skipped, 0 failed across desktop and mobile. |
| Live `npm run test:e2e` | PASS — 36 passed, 2 dedicated large-file cases skipped, 0 failed across desktop and mobile. |
| `npm run test:claims` | PASS — 10 desktop claims passed, the large case was skipped there and then passed through its dedicated command. |
| `verify-url.sh` | PASS — HTTP 200, title, `lang=en`, one h1, main, image alt text, labelled buttons, and no console errors. |
| Lighthouse mobile | PASS — Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 1.44 s and CLS 0. |

The standalone Axe CLI could not create a browser session because its bundled
ChromeDriver supports Chrome 152 while the supplied Playwright Chromium is
145. This leaves no accessibility test gap: the local and live suites use
`@axe-core/playwright` 4.13 on the landing page, populated workspace, legal
routes, and designed 404 in desktop and mobile projects. They reported no
serious or critical violations.

Initial assets remain inside the static budgets: entry JavaScript is 34,969
bytes (11.64 kB gzip), CSS is 21,069 bytes (5.42 kB gzip), and the hero AVIF is
77,596 bytes. DuckDB and its WASM are deferred until a file opens.

## Declared claims

All 11 commands in `.factory/claims.json` were run separately from the clean
checkout. Each ID occurs exactly once as `@claim:<id>` in the test suite.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — one test passed. |
| `local-processing` | PASS — one test passed. |
| `offline-reload` | PASS — one test passed. |
| `core-workflow` | PASS — one test passed. |
| `csv-export` | PASS — one test passed. |
| `parquet-export` | PASS — one test passed. |
| `supported-file-formats` | PASS — one test passed. |
| `mobile-controls` | PASS — one test passed. |
| `real-file-storage` | PASS — one test passed. |
| `import-recovery` | PASS — one test passed. |
| `large-file` | PASS — the dedicated 5,000,000-row / about 1 GB test passed. |

The separate production-preview benchmark opened and counted 5,000,000 rows
and 1,012,961,173 bytes in **16.21 seconds**, below the public 30-second
Chromium-environment limit. The landing page, legal pages, dialogs, metadata,
README, manifest, and 404 were checked against the inventory. Every public
reliance statement maps to a passing claim; untested claim count is zero.

## Product, boundary, and recovery evidence

- Normal CSV, TSV, TXT, first-sheet XLSX, quoted comma, quoted LF/CRLF
  multiline CSV, and a one-row numeric-boundary CSV open successfully.
- Empty and header-only CSV files reach a stable 0-row workspace. A one-row
  file reports one row. No console or page errors occurred.
- An inconsistent separator offers a chosen-separator retry. Unterminated
  quoting opens specific recovery controls. A forced engine-start failure
  explains that nothing was uploaded and offers retry.
- Sorting, filter, column profile, group summary, pivot, read-only SQL, CSV,
  and typed Parquet all complete. Modifying SQL is rejected and a later
  read-only query succeeds.
- At 390 px, the four workspace actions meet 44 px targets, retain 8 px gaps,
  and do not overflow. `/`, `g`, and `e` work. Dialog Escape restores trigger
  focus. Reduced-motion durations compute to `1e-05s`.
- The offline sample reload passes. `sw.js` is served with `no-cache`, uses a
  versioned shell cache, calls `skipWaiting`, claims clients, and removes old
  caches on activation.

## Routes, privacy, links, and deployment

`/`, `/demo`, `/privacy/`, and `/terms/` return 200 with unique titles,
`lang=en`, one h1, main, shared navigation, canonical metadata, and route
focus. All real internal and external links returned 200. An unknown route
deliberately returns HTTP 404 with the Glassline shell and working links home
and to the sample; that expected status is not a defect.

The application is static and local-first. It has no backend, tenant,
database, health endpoint, restart-persistence surface, or 429 contract, so
those backend checks do not apply. Request capture found only the product
origin, and storage tests found no chosen-file or export contents in web
storage, IndexedDB, OPFS, or caches.

All 29 public files in the fresh `dist/` build match the live deployment
byte-for-byte, including HTML, legal pages, sample, service worker, entry
assets, source maps, DuckDB workers/WASM, and Parquet extensions. Key hashes:

- `index.html`: `60e6b7fd7d20fb6c5ca276f84d16e4846c2b1a4105ed08b2fdc3bf9fc28b91f4`
- `assets/index-BwFDfBSE.js`: `1a9a212029473155c176bbf7bdb5841022f0f84101313c155d8c4e449639c10b`
- `assets/index-DXTj45fr.css`: `09d6720b2e452d4d618e79c178da4291f1bad2321d33a597b0a0dfd69f55539f`

The live root sends HSTS, a same-origin CSP with the required WASM allowance,
`nosniff`, denied framing, strict referrer policy, and restrictive permissions
policy. Hashed assets are immutable for one year; `sw.js` is not cached by HTTP.

## Earlier findings disposition

| Earlier finding | Current evidence |
| --- | --- |
| Review 1: no demo, no claim inventory, missing audience, generic 404 | Resolved: fresh phone/desktop demo and claim evidence above; the 404 is product-styled and returns the expected status. |
| Review 1: untested/jargon-heavy copy, incomplete metadata/skeleton, vague controls | Functional and claim parts are resolved. Review 3 finds three remaining plain-words/site-structure defects below. |
| Review 2 F-2-1 to F-2-4: unlisted size, storage, recovery, deployment claims | Resolved: all are inventoried once and every declared command passes. |
| Review 2 F-2-5: route focus | Resolved: home/demo history, legal routes, dialogs, and 404 focus/announcements pass. Initial focus is already on main h1, so Tab proceeds to the sample action; this corrects earlier prose that called the skip link the first Tab stop. |
| Review 2 F-2-6: “real workspace” | Resolved: current action says “Start for real.” |
| Review 2 F-2-7: export used for input and output | Resolved: input is consistently called a file; export means the download. |
| Review 2 F-2-8: picker omitted TXT | Resolved: picker and adjacent copy name CSV, TSV, TXT, and XLSX. |
| Review 2 F-2-9 to F-2-13: privacy, QA, fixture, deploy, and parser jargon | Resolved in visitor copy and README; exact technical names remain only where needed to run verification. |
| Review 2 F-2-14: duplicate picker stops | Resolved: the file input is the single picker stop. |
| Verification 1: parallel instability and malformed-input recovery | Resolved: one worker is configured; full commands and malformed recovery pass. |
| Verification 2: live CSP blocked DuckDB-WASM | Resolved: live normal/large workflows pass with no CSP error. |
| Verification 3: Parquet export failed | Resolved: downloaded Parquet metadata proves 10 filtered rows and 11 fields. |
| Verification 4: 42 px phone actions | Resolved: current measurements meet 44 px plus 8 px separation. |
| Verification 5: valid multiline CSV rejected | Resolved: LF and CRLF quoted multiline fixtures pass locally and live. |
| Verifications 6 and 7: no functional defects | Retained for functional scope; this stricter contract review adds the three low findings below. |

## Findings

### R3-L1 — Low — The landing page omits the required privacy and limits section

After the first-screen facts and three-step strip, the page goes directly to
the footer. It has no separate section that says what the product does not do
or explains its practical privacy/file-size limits. The site-structure
contract requires that section after “How it works.” The Privacy link and
short trust facts reduce impact, so this is low severity.

**Required repair:** Add a short, plain section after the steps using already
tested statements: files stay in the tab, the sample cache is public, no cloud
save or collaboration exists, and browser memory can limit very large files.
Map any new reliance wording to the existing claims or add a claim test.

### R3-L2 — Low — The `/demo` route hides the required site footer

In a fresh live `/demo` context, `#site-footer` has `hidden`, computed display
is `none`, and Terms, “Built by Param Factory,” and version `v1.2` are absent
from the visible/accessibility route. The site-structure contract requires the
standard footer on every route. Privacy remains in the header, so this does not
block the CSV job.

**Required repair:** Keep a compact route footer available below or beside the
workspace, with the one-line job, Privacy, Terms, builder link, and version.
Preserve the full-height grid and phone safe area.

### R3-L3 — Low — Secondary headings use prohibited decorative metaphors

The designed 404 says **“404 · OUTSIDE THE GRID”** and **“This page has no
rows.”** Dialog labels include **“Shape the view,” “Power view,”** and **“Take
the answer.”** These labels are not needed to operate the product, but they
violate the explicit plain-words rule against metaphor, mood headings, and
decorative labels. The adjacent functional headings remain clear, so impact is
low.

**Required repair:** Use literal labels or remove the decorative lines. For
example, use **“Page not found”**, **“Filter rows”**, **“Query with SQL”**, and
**“Export this view.”** Re-run the copy audit across dialogs and the 404, not
only the landing page and README.

## Final counts

- Critical: 0
- High: 0
- Medium: 0
- Low: 3
- Total findings: 3
- Untested public claims: 0
- **Verdict: FAIL**
