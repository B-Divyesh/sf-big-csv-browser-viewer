# Adversarial first-read review 2 — Glassline

**Verdict: FAIL**

Review date: 2026-08-28. Target: <https://big-csv-browser-viewer.sociobot.in>. The live product is clear and tryable, and every listed claim test passes. It still has blocking unlisted claims and an incompletely repaired route-focus requirement. The acceptance rule requires zero findings and no untested claim.

## Cold first screen

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** It opens a large CSV locally so I can filter it and export selected rows.
- **For whom:** Analysts with exports too large for Excel.
- **What I should click first:** **Try it with sample data** to open the 40-row order file. **Open your own file** is the adjacent real-data path.

All three answers are present on the first screen at both widths. The exact copy that succeeds is **“Filter large CSV files in your browser.”**, **“For analysts handling exports too large for Excel, find and export the rows you need.”**, and **“Try it with sample data.”** The 390 px document width remained 390 px, all three short facts were above the fold, and no console error occurred.

## Findings, ordered by severity

### F-2-1 — BLOCKING — The core large-file promise is absent from the claim inventory

**Quote / location:** Landing headline and footer: **“Filter large CSV files in your browser.”** Landing audience line: **“exports too large for Excel.”** README opening: **“large CSV files”**, **“beyond spreadsheet limits”**, and **“too large for Excel.”**

**Evidence:** `.factory/claims.json` has no large-file, row-count, byte-size, or time claim. Its core-workflow test uses only the 40-row sample. `scripts/benchmark-large.mjs` is not referenced by a claim entry and has no `@claim:` tag. A supplemental clean-clone run did successfully open and count 5,000,000 rows / 1,012,961,173 bytes in 15.38 seconds, but an optional unlisted benchmark is not the required traceable claim test.

**Why this matters:** Handling files beyond Excel is the product’s central job, not incidental marketing. A visitor cannot tell what “large” means or find the test behind the promise.

**Concrete fix:** Add a `large-file` entry stating a measurable bound and environment, for example **“Opens and counts a 5,000,000-row, about 1 GB CSV within 30 seconds in the Chromium benchmark environment.”** Point it to one clean, automated `@claim:large-file` command that generates the file outside the repository and asserts rows, bytes, and elapsed time. Otherwise remove every large/beyond-Excel statement.

This is a recurrence of review 1’s **“Required claim inventory and claim tests are absent”** finding. Review 1 supplied no finding IDs, so there is no earlier identifier to reuse.

### F-2-2 — BLOCKING — Storage and privacy statements exceed the listed tests

**Quote / location:** README: **“It does not store files you choose or their results.”** and **“Refreshing the real workspace clears its active file.”** Privacy: **“It has no analytics, advertising, trackers, remote fonts, or third-party scripts.”** and **“Close or refresh the tab to clear the active workspace.”**

**Evidence:** `demo-sandbox` checks demo memory plus local/session storage. `local-processing` checks request origins and cache names during the demo. `supported-file-formats` happens to check a real-file refresh, but that behavior is not stated in its claim. No claim entry covers persistence of a user-selected file across localStorage, sessionStorage, IndexedDB, OPFS, CacheStorage, refresh, and tab closure, or the categorical no-analytics statement.

**Why this matters:** These are reliance statements about sensitive files. Passing a narrower demo request test does not list or prove the broader promises.

**Concrete fix:** Add one explicit real-file-storage claim and tagged test that loads a deterministic user file, inventories all browser stores before and after use, refreshes, closes/reopens the page, and verifies no file or result persists. Add a separate no-tracking claim/test that asserts the complete allowed request path list, or narrow/remove that sentence.

This is also a recurrence of review 1’s claim-inventory finding.

### F-2-3 — BLOCKING — Import-limit and recovery claims are unlisted

**Quote / location:** README Practical limits: **“Glassline expects UTF-8 text.”** and **“Use the import recovery controls for inconsistent delimiters or column types.”**

**Evidence:** `supported-file-formats` covers valid UTF-8 fixtures. No claim entry asserts the UTF-8 limitation or exercises the delimiter and all-text recovery controls. An untagged malformed-quote test does not cover those advertised recovery outcomes.

**Why this matters:** A user with an inconsistent export may rely on recovery that the claim suite never verifies.

**Concrete fix:** Add an `import-recovery` claim and tagged browser test with a failing delimiter/type fixture, then assert a successful retry through each promised control. State the encoding limitation in that entry. Remove the recovery instruction if the controls cannot reliably repair such files.

This is also a recurrence of review 1’s claim-inventory finding.

### F-2-4 — BLOCKING — README makes an unlisted deployment-behavior claim

**Quote / location:** README Build and deploy: **“The static-site configuration applies security headers, caches versioned assets, routes `/demo`, and serves the designed 404 page.”**

**Evidence:** Route and 404 assertions exist in an untagged browser test, but `.factory/claims.json` has no entry for this sentence and does not name a command that verifies all four outcomes.

**Why this matters:** The README says every reliance claim is recorded in the inventory, while this one is not.

**Concrete fix:** Remove the sentence, or add one listed deployment claim whose test checks the built configuration plus live-equivalent headers, `/demo`, cache policy, and unknown-route response.

This is also a recurrence of review 1’s claim-inventory finding.

### F-2-5 — BLOCKING — Route-change focus is only implemented for entering the demo

**Quote / location:** Live navigation from Demo back to Home and from Home to Privacy. After `page.goBack()`, the URL and landing content were correct, but `document.activeElement` was `<body>` and `#route-status` was empty. Clicking **Privacy** likewise loaded the correct page with focus on `<body>`.

**Code evidence:** `src/main.ts` focuses `#workspace-title` in `enterWorkspace()`, but has no `popstate` or `pageshow` handler for returning home. The static Privacy and Terms documents do not focus their h1 after navigation.

**Why this matters:** Keyboard and screen-reader users receive no focused route heading on Back or legal-page navigation, despite the route-focus requirement. Content routing works, but the accessibility state does not.

**Concrete fix:** On history traversal and app route completion, focus the new h1 with `tabindex="-1"` and update the polite route announcement. Add a test that clicks Demo, goes Back, goes Forward, and visits Privacy/Terms while asserting the correct h1 receives focus each time.

This leaves review 1’s **“Site metadata and route skeleton are incomplete”** repair incomplete, so it is blocking again. That earlier review supplied no ID.

### F-2-6 — Minor — “Real workspace” is ambiguous inside a sandboxed demo

**Quote / location:** Landing beside the sample action: **“Opens a 40-row order file in the real workspace.”**

**Why this matters:** “Real” can suggest that sample actions touch real storage, which conflicts with the adjacent demo-isolation message.

**Concrete fix:** Use **“Opens 40 sample orders in the full CSV viewer.”**

### F-2-7 — Minor — “Export” names both the input and the output

**Quote / location:** Landing: **“For analysts handling exports too large for Excel…”** README: **“For analysts who receive spreadsheet exports too large for Excel…”** Elsewhere, “export” means the downloaded result.

**Why this matters:** One term identifies both the file coming in and the file going out, contrary to the repository terminology table.

**Concrete fix:** Use **“For analysts handling files too large for Excel, find and export the rows you need.”** and **“For analysts who receive files too large for Excel and need a quick answer.”**

### F-2-8 — Minor — The real-file action excludes formats named beside it

**Quote / location:** Landing file control: **“Drop or choose CSV, TSV, TXT, or XLSX”** beside **“Open your CSV.”**

**Why this matters:** A visitor with TSV, TXT, or XLSX is told the format is supported and then sees a result label that names only CSV.

**Concrete fix:** Rename it **“Open a data file.”**

### F-2-9 — Minor — Privacy copy uses protocol jargon

**Quote / location:** README Privacy and offline use: **“The tested demo flow makes same-origin runtime requests only.”**

**Why this matters:** “Same-origin runtime requests” requires web-platform knowledge and does not state the user consequence directly.

**Concrete fix:** Use **“During the tested demo, every network request stayed on this site.”**

### F-2-10 — Minor — The verification section uses internal QA jargon

**Quote / location:** README Verify: **“Each reliance claim and its exact command is recorded in `.factory/claims.json`.”**

**Why this matters:** “Reliance claim” is not ordinary user or contributor language. The sentence is also currently false because of F-2-1 through F-2-4.

**Concrete fix:** After completing the inventory, use **“Each product promise and its test command appears in `.factory/claims.json`.”**

### F-2-11 — Minor — The benchmark instruction uses “fixture” without explanation

**Quote / location:** README Verify: **“The optional large-file benchmark generates its fixture outside the repository.”**

**Why this matters:** “Fixture” is testing jargon where “test file” says the same thing plainly.

**Concrete fix:** Use **“The optional large-file speed test creates its test file outside the repository.”**

### F-2-12 — Minor — The deployment sentence compresses several technical terms

**Quote / location:** README Build and deploy: **“The static-site configuration applies security headers, caches versioned assets, routes `/demo`, and serves the designed 404 page.”**

**Why this matters:** “Static-site configuration,” “security headers,” “versioned assets,” and “routes” make one dense sentence. F-2-4 separately covers its missing claim entry.

**Concrete fix:** If the sentence remains, use **“Deployment settings protect browser requests, cache app files, open `/demo`, and show Glassline’s 404 page.”**

### F-2-13 — Minor — Import guidance uses unexplained parser terms

**Quote / location:** README Practical limits: **“Use the import recovery controls for inconsistent delimiters or column types.”**

**Why this matters:** “Inconsistent delimiters” and “column types” do not tell a non-technical analyst which control to choose.

**Concrete fix:** After adding the test in F-2-3, use **“If columns load incorrectly, choose the file’s separator or import every column as text.”**

### F-2-14 — Minor — The file picker creates two consecutive keyboard stops

**Quote / location:** Landing file control. Tab reaches the `label#drop-zone`, then immediately reaches its nested `input#file-input`; both open the same file picker and share the same visual card.

**Why this matters:** Keyboard users must traverse the same action twice, and the second control has no separate visible label.

**Concrete fix:** Keep one native focus target. Remove `tabindex="0"` and the label key handler, make the file input cover the whole card, and retain the designed `:focus-within` outline. Add a Tab-order assertion.

## Copy audit

Counts use whitespace-separated words; hyphenated terms, paths, URLs, and keyboard keys count as one. Punctuation-only separators are excluded. Repeated footer/header text is marked rather than silently omitted. No sentence exceeds 22 words, and no banned marketing adjective appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Glassline | 1 | Pass |
| Ready locally | 2 | Pass |
| Demo | 1 | Pass |
| Privacy | 1 | Pass |
| Runs on this device | 4 | Pass; listed local-processing claim |
| Filter large CSV files in your browser. | 7 | F-2-1, unlisted scale claim |
| For analysts handling exports too large for Excel, find and export the rows you need. | 15 | F-2-1 scale claim; F-2-7 terminology |
| Try it with sample data | 5 | Pass; result-naming action |
| Opens a 40-row order file in the real workspace. | 9 | F-2-6 ambiguity; quantity covered by demo-sandbox |
| Open your own file | 4 | Pass; result-naming action |
| Drop or choose CSV, TSV, TXT, or XLSX | 8 | Pass; formats covered by supported-file-formats |
| Open your CSV | 3 | F-2-8 inconsistent action label |
| File stays in this tab | 5 | Pass; listed local-processing claim |
| Works offline after the first visit | 6 | Pass only when read as the listed sample-workspace claim; qualify it during the claim repair |
| Free to use | 3 | Pass; listed demo-sandbox claim |
| Abstract glass data slab unfolding into a vast field of ordered rows | 12 | Pass; image alt text |
| Filter · Pivot · Query | 3 | Pass; listed core-workflow claim |
| Processed on this device | 4 | Pass; listed local-processing claim |
| 01 | 1 | Pass; step marker |
| Open your CSV | 3 | F-2-8; second occurrence |
| Choose the file you received. | 5 | Pass |
| 02 | 1 | Pass; step marker |
| Filter and summarize rows | 4 | Pass; result-naming heading |
| Sort, group, pivot, or query. | 5 | Pass; listed core-workflow claim |
| 03 | 1 | Pass; step marker |
| Export selected rows | 3 | Pass; result-naming heading |
| Download CSV or Parquet. | 4 | Pass; listed export claims |
| Filter large CSV files in your browser. | 7 | F-2-1; repeated footer claim |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v1.1 · Original AI-generated artwork | 4 | Pass; version and provenance disclosure |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Glassline | 1 | Pass |
| Filter, summarize, query, and export large CSV files in your browser. | 11 | F-2-1 scale claim; functions otherwise listed |
| Glassline is for analysts working beyond spreadsheet limits. | 8 | F-2-1 scale claim |
| Live product: https://big-csv-browser-viewer.sociobot.in | 3 | Pass |
| Demo: https://big-csv-browser-viewer.sociobot.in/?demo=1 | 2 | Pass |
| Who it is for | 4 | Pass |
| For analysts who receive spreadsheet exports too large for Excel and need a quick answer. | 14 | F-2-1 scale claim; F-2-7 terminology |
| What it does | 3 | Pass |
| Opens CSV, TSV, TXT, and the first worksheet of XLSX files. | 11 | Pass; listed format claim |
| Filters, sorts, groups, pivots, profiles columns, and runs read-only SQL. | 10 | Pass; necessary domain terms and listed workflow claim |
| Exports every filtered row as CSV or Parquet. | 8 | Pass; listed export claims |
| Opens 40 sample orders without an account and resets them on demand. | 12 | Pass; listed demo claim |
| Keeps workspace actions usable at 390 px and supports `/`, `g`, and `e` keyboard shortcuts. | 14 | Pass; listed mobile-controls claim |
| The sample route uses the real workspace. | 7 | Pass for behavior; “real workspace” is addressed in F-2-6 on the visitor-facing occurrence |
| See `.factory/demo.md` for its data and isolation model. | 8 | Pass |
| Privacy and offline use | 4 | Pass |
| File processing happens in browser memory. | 6 | Pass; listed local-processing claim |
| The tested demo flow makes same-origin runtime requests only. | 9 | F-2-9 jargon; listed local-processing claim |
| The offline cache stores app files and the public sample. | 10 | Pass; listed offline claim |
| It does not store files you choose or their results. | 10 | F-2-2 unlisted storage claim |
| After one completed visit, the sample workspace can reopen offline. | 10 | Pass; listed offline claim |
| Refreshing the real workspace clears its active file. | 8 | F-2-2 unlisted persistence claim |
| See the privacy page. | 4 | Pass |
| Develop | 1 | Pass |
| Use Node.js 20 or newer. | 6 | Pass; development requirement |
| Verify | 1 | Pass |
| Each reliance claim and its exact command is recorded in `.factory/claims.json`. | 11 | F-2-10 jargon; contradicted by F-2-1 through F-2-4 |
| The optional large-file benchmark generates its fixture outside the repository. | 10 | F-2-11 jargon |
| Build and deploy | 3 | Pass |
| Run `npm ci && npm test && npm run build`. | 8 | Pass |
| Deploy the contents of `dist/` as an Azure Static Web App. | 11 | Pass; deployment instruction |
| The static-site configuration applies security headers, caches versioned assets, routes `/demo`, and serves the designed 404 page. | 17 | F-2-4 unlisted claim; F-2-12 jargon |
| Practical limits | 2 | Pass |
| Browser memory sets the file-size ceiling. | 6 | Pass; limitation rather than a guaranteed capacity |
| Very large files may fail. | 5 | Pass; limitation |
| Glassline expects UTF-8 text. | 4 | F-2-3 unlisted compatibility claim |
| Use the import recovery controls for inconsistent delimiters or column types. | 11 | F-2-3 unlisted behavior claim; F-2-13 jargon |
| License | 1 | Pass |
| MIT © 2026 Sociobot (Param Factory). | 5 | Pass |

## Demo and sandbox verification

**Result: PASS.** From a fresh 390 px context, the first click on **Try it with sample data** opened `sample-orders.csv` in the actual data grid. The first demo screen already showed 40 realistic order rows with order IDs, dates, regions, channels, statuses, customers, categories, amounts, and owners. The persistent banner read **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Start for real**.

Filtering North reduced the result to 10 rows. **Reset demo** restored all 40 rows. **Start for real** returned to `/`, hid the banner, and showed the empty file-opening screen.

Before entering the demo, the browser was seeded with `real:sentinel` values in localStorage and sessionStorage, an IndexedDB database, and an OPFS file. All four survived demo entry, filtering, reset, and exit unchanged. The demo created no additional local/session/IndexedDB/OPFS workspace data. CacheStorage contained only the documented `glassline-shell-v4` offline cache. Nineteen observed requests used only `https://big-csv-browser-viewer.sociobot.in`; console errors: 0.

## Claims verification

Clean clone: `/tmp/bigcsv-review2-FgmY7x/clone`, commit `0e5a0a7864fbae606855f2793b5c8268cf8db786`. `npm ci`, `npm run build`, and `npm test` passed; unit result was 8/8. Each command from `.factory/claims.json` was then run separately.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | 1 test passed in 8.6 s |
| `local-processing` | PASS | 1 test passed in 7.5 s |
| `offline-reload` | PASS | 1 test passed in 8.9 s |
| `core-workflow` | PASS | 1 test passed in 11.0 s |
| `csv-export` | PASS | 1 test passed in 6.3 s |
| `parquet-export` | PASS | 1 test passed in 6.1 s |
| `supported-file-formats` | PASS | 1 test passed in 15.0 s |
| `mobile-controls` | PASS | 1 test passed in 4.9 s |

Each ID occurs exactly once in `tests/app.spec.ts`. No listed claim test failed. The deployed full suite also passed 30/30 across desktop and 390 px mobile in 2.8 minutes. The supplemental current-build 5M-row / 1.013 GB benchmark passed in 15.38 seconds, but remains unlisted as described in F-2-1.

## Earlier-finding verification

No `.factory/polish-*.md` files exist. `.factory/review-1.md` and the prior `.factory/handoff.md` were read in full. Review 1 did not assign finding IDs, so its exact headings are used below.

| Earlier finding | Live and source result |
| --- | --- |
| No one-click sample-data demo or sandbox | **Fixed.** One click opens realistic rows; banner, reset, exit, isolation, direct `?demo=1`, and `/demo` all work. |
| Required claim inventory and claim tests are absent | **Partly fixed; BLOCKING again as F-2-1 through F-2-4.** Eight listed tests exist and pass, but several live/README reliance statements remain unlisted. |
| First screen does not identify its intended user | **Fixed.** The first screen names analysts handling files beyond Excel and gives a clear first action. |
| The production 404 is an Azure template | **Fixed.** An unknown URL returns HTTP 404 with Glassline title, h1, navigation, footer, and same-origin styling. |
| Landing and README copy use untested claims and technical shorthand | **Exact cited strings fixed.** New remaining claim gaps and jargon are recorded as F-2-1 through F-2-4 and F-2-9 through F-2-13. |
| Site metadata and route skeleton are incomplete | **Partly fixed; BLOCKING again as F-2-5.** Titles, metadata, shared chrome, demo route, sitemap, and 404 pass; Back/legal-route focus does not. |
| Some buttons and headings do not name their result | **Fixed in the cited locations.** The landing steps now say Open, Filter and summarize, and Export. F-2-8 is a new format-label inconsistency. |

## Structure, accessibility, and links

- Home, Demo, Privacy, Terms, and the designed 404 each return the expected 200/404 status, have `lang="en"`, one visible h1, a main landmark, and route-appropriate titles. Home title length is 50 characters.
- Home, Demo, Privacy, and Terms include descriptions, canonical URLs, Open Graph/Twitter metadata, SVG favicon, and Apple touch icon. The 404 deliberately has no canonical but has a route-specific title, description, icons, header, footer, and home/sample recovery links.
- `robots.txt`, `sitemap.xml`, social art, touch icon, every internal link, and the external Sociobot link returned 200. The sitemap lists Home, Demo, Privacy, and Terms.
- The deployed suite’s axe checks found zero serious/critical issues on landing, workspace, legal routes, and 404. No console errors occurred in the cold, demo, or full live-suite runs.
- Initial built JavaScript is 34.66 KB uncompressed / 11.54 KB gzip. The large DuckDB engine is deferred. Reduced-motion handling and visible focus styling are present.
- The midnight glass grid, mint scan line, generated data-landscape art, dense workspace, and designed 404 form a distinct product identity rather than a generic gradient/card template.
- Back/route focus fails as F-2-5, and the duplicate landing file-input stop is F-2-14.

## Missed leverage

No additional feature finding. Import supports CSV, TSV, TXT, and XLSX; filtered data exports to CSV and Parquet; the brief’s filter, profile, group, pivot, and read-only SQL tasks are present. Sync would conflict with the local-only value proposition. An AI step is not an obvious improvement to deterministic local analysis, so adding one would be decorative rather than useful. No provider key or runtime AI call is present.

## What would make this perfect

1. Put every public reliance statement—especially the 5M-row / 1 GB core promise—into `.factory/claims.json` with one exact tagged test, or remove/narrow the copy.
2. Complete route focus and announcement behavior for Back, Forward, Privacy, and Terms.
3. Apply the proposed plain-word rewrites and remove the duplicate file-picker tab stop.
4. Re-run all claim commands, the full live desktop/mobile suite, storage/request inspection, link crawl, axe, and the large-file benchmark. A new review can pass only if that produces zero findings.
