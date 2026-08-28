# Adversarial first-read review 1 — Glassline

**Verdict: FAIL**

Review date: 2026-08-28. Target: <https://big-csv-browser-viewer.sociobot.in>. The verdict has four blocking findings, so it does not meet the acceptance threshold regardless of the minor findings below.

## Cold first screen

Fresh Chromium contexts were checked at 390 × 844 and 1440 × 900 before scrolling. There were no browser-console errors and the 390 px document width was 390 px.

My first-read interpretation was: this is a local browser tool for opening a large CSV, then filtering, pivoting, and exporting it. The first action appears to be **“Drop a data file here”** (or choose a file). I could not tell **for whom** from the first screen. The page calls itself **“LOCAL DATA WORKSPACE”**, but does not name an analyst, operations worker, finance worker, spreadsheet user, or other situation. Therefore the mandatory what / for whom / first-action test fails.

## Findings, ordered by severity

### BLOCKING — No one-click sample-data demo or sandbox

**Quote / evidence:** The first screen offers only **“Drop a data file here”** and **“or choose CSV, TSV, or XLSX”**. `/demo` returns HTTP 404. `/?demo=1` returns HTTP 200 but shows the same empty upload landing page. The repository has no `.factory/demo.md`, sample dataset, demo banner, or demo storage namespace.

**Why this loses or misleads a first-time visitor:** A visitor who has 30 seconds cannot see filtering, grouping, pivoting, SQL, or export before trusting the product with a real file. It also makes the required isolated verification path unavailable.

**Concrete fix:** Add a visible first-screen button labelled **“Try it with sample data”** and make `/demo` (or `?demo=1`) immediately open a realistic orders/export dataset in the real grid. Show a persistent **“Demo — sample data, nothing is saved”** banner with **“Reset demo”** and **“Start for real”**. Keep demo data in a `demo:` storage namespace or in memory, document it in `.factory/demo.md`, and test reset, separation from real storage, and offline use from a fresh browser context.

### BLOCKING — Required claim inventory and claim tests are absent

**Quote / evidence:** `.factory/claims.json` is absent. `rg -n '@claim:'` finds no claim-tagged test. The live landing page nevertheless makes reliance claims including **“without uploading a single byte”**, **“Never uploaded”**, **“No row limit”**, and **“Your file never leaves this device.”** README makes further claims, including **“Works at 390 px, supports keyboard navigation, and caches the app shell for repeat/offline use.”**

**Why this loses or misleads a first-time visitor:** Privacy, offline, file-size, compatibility, and export statements are presented as facts but cannot be traced to an observable test in the required sandbox. With no demo, the promised privacy/offline interception check cannot be performed through the approved visitor path either.

**Concrete fix:** Add `.factory/claims.json` with one entry and one `@claim:<id>` test for every claim-like statement that remains. At minimum cover local-only network behaviour across the demo flow, offline reload after first visit, CSV and Parquet export contents, supported file formats, 390 px controls, and any retained “no row limit” or row-count claim. Remove or qualify claims that cannot be tested. Run each command listed in the file from a clean clone and record the result.

### BLOCKING — First screen does not identify its intended user

**Quote:** **“Your biggest CSV. Finally navigable.”** and **“Open millions of rows, filter the noise, build a pivot, and export the answer—without uploading a single byte.”**

**Why this loses or misleads a first-time visitor:** The visitor can infer a CSV tool and an upload action, but cannot answer who it is for. The headline is a slogan rather than the job in user words; “filter the noise” and “navigable” are also less specific than the actual task. This fails the mandatory cold-screen comprehension test.

**Concrete fix:** Use a headline such as **“Filter large CSV files in your browser”** and a ≤22-word situation sentence such as **“For analysts handling spreadsheet exports too large for Excel, find and export the rows you need.”** Keep **“Try it with sample data”** beside the real-file action and state what it opens.

### BLOCKING — The production 404 is an Azure template

**Quote / evidence:** Requesting `/does-not-exist` returns HTTP 404 headed **“Azure Static Web Apps - 404: Not found”**, loading Azure CDN styles, scripts, and imagery. It contains no Glassline wordmark or route back to the product.

**Why this loses or misleads a first-time visitor:** A mistyped link abruptly changes the visual identity, introduces third parties, and strands the visitor outside the product. This explicitly fails the designed-404 requirement.

**Concrete fix:** Ship a Glassline-styled `404.html` with an explanatory h1 and an **“Open Glassline”** link. Configure `staticwebapp.config.json` to serve it for 404 responses, then crawl an unknown URL and assert the product title, h1, home link, and no third-party requests.

### Major — Landing and README copy use untested claims and technical shorthand

**Quote:** **“DuckDB powered”**, **“No row limit”**, **“DuckDB-WASM does the work”**, **“RFC-style quoted fields with embedded LF or CRLF line breaks”**, and **“narrow CSP3 `wasm-unsafe-eval` allowance.”**

**Why this loses or misleads a first-time visitor:** The landing’s technical badge does not explain a visitor benefit, while the README shifts between CSV, data file, export, file, workspace, and view. Several claims are both jargon-heavy and unlisted (see blocking claim finding).

**Concrete fix:** Replace the landing badge **“DuckDB powered”** with a tested visitor fact such as **“Runs on this device”**. Use one primary term, e.g. “file,” for the imported CSV throughout user-facing copy. Move implementation details such as RFC line endings and CSP to a technical notes section or rewrite them in plain language.

### Major — Site metadata and route skeleton are incomplete

**Quote / evidence:** The home document has a title, description, language, SVG favicon, one h1, and main landmark, but no canonical URL, Open Graph tags, Twitter card, or Apple-touch icon. `/privacy/` and `/terms/` lack meta descriptions, canonical/OG/Twitter tags, skip links, the full header, and footer links to both Privacy and Terms. The home header has no Demo link. `sitemap.xml` has no demo route because none exists.

**Why this loses or misleads a first-time visitor:** Shared links do not carry product artwork or a consistent explanation. Legal routes feel detached from the product and do not retain basic navigation or the required common header/footer.

**Concrete fix:** Add per-route metadata, canonical URLs, generated product OG image and Twitter card, plus an Apple touch icon. Use the same skip link, wordmark, Demo/Privacy navigation, and footer (Privacy, Terms, Built by Param Factory, build/version) on every route. Add the functioning demo URL to the sitemap.

### Minor — Some buttons and headings do not name their result

**Quote:** **“Choose file”**, **“Shape”**, and **“Take.”**

**Why this loses or misleads a first-time visitor:** “Shape” and “Take” are context-dependent verbs; “Choose file” does not say what the selection will accomplish. They make the three-step strip harder to scan out of context.

**Concrete fix:** Use **“Open your CSV”**, **“Filter and summarize rows”**, and **“Export selected rows.”**

## Copy audit

Word counts treat hyphenated or slash-separated terms as one word and list visible landing copy plus every prose sentence, heading, and bullet in README. `!` marks a finding: `L` = over 22 words, `J` = jargon/technical shorthand, `M` = marketing/vague wording, `I` = inconsistent terminology, `H` = heading/button does not stand alone.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Glassline | 1 | — |
| Ready locally | 2 | — |
| Local data workspace | 3 | J |
| Your biggest CSV. Finally navigable. | 5 | M |
| Open millions of rows, filter the noise, build a pivot, and export the answer—without uploading a single byte. | 19 | J, unlisted claim |
| Drop a data file here | 5 | I |
| or choose CSV, TSV, or XLSX | 6 | J |
| Choose file | 2 | H |
| Never uploaded | 2 | unlisted claim |
| DuckDB powered | 2 | J, unlisted claim |
| No row limit | 3 | unlisted claim |
| 5,000,000 rows | 4 | unlisted quantitative claim |
| Processed on this device | 4 | unlisted claim |
| Open | 1 | H |
| Drop the export as-is. | 4 | J, I |
| Shape | 1 | H |
| Filter, sort, group, pivot. | 4 | — |
| Take | 1 | H |
| Export only what matters. | 4 | M |
| Glassline runs inside your browser. Your file never leaves this device. | 11 | unlisted claim |
| Privacy | 1 | — |
| Terms | 1 | — |
| Original AI-generated artwork | 3 | — |

Proposed landing rewrites are in the related findings: replace the headline and audience line; use one “file” term; change the three-step labels; and remove technical/claim badges unless backed by the claim inventory.

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Glassline | 1 | — |
| Glassline opens, filters, groups, pivots, queries, and exports CSV files that are too large for a spreadsheet. | 17 | unlisted claim |
| DuckDB-WASM does the work inside the browser: files and results never go to a server. | 15 | J, unlisted claim |
| Live product: https://big-csv-browser-viewer.sociobot.in | 6 | — |
| Who it is for | 4 | — |
| Analysts, operations teams, and finance staff who receive multi-million-row exports and need an answer without installing Python, learning a database CLI, or uploading sensitive data to a SaaS tool. | 29 | L, J |
| What works | 2 | H |
| Opens CSV, TSV, text, and the first worksheet of XLSX files, including RFC-style quoted fields with embedded LF or CRLF line breaks. | 22 | J, unlisted claim |
| Reads CSV directly through the browser file handle, avoiding a duplicate in-memory copy. | 13 | J, unlisted claim |
| Detects delimiters, headers, and data types, with recovery controls for inconsistent files. | 12 | J, unlisted claim |
| Shows a 100-row virtual window with sorting and direct row-number jumping. | 11 | J, unlisted quantitative claim |
| Builds multiple AND filters with typed numeric and date comparisons. | 10 | J, unlisted claim |
| Profiles any column with filled, distinct, min, and max statistics. | 10 | J, unlisted claim |
| Creates group summaries and pivots (up to 20 pivot values and 500 result rows). | 14 | unlisted quantitative claim |
| Runs read-only DuckDB SQL against the `data` view, capped at 1,000 displayed rows. | 14 | J, unlisted quantitative claim |
| Exports the entire filtered view as CSV or compressed Parquet. | 10 | J, unlisted claim |
| Works at 390 px, supports keyboard navigation, and caches the app shell for repeat/offline use. | 15 | J, unlisted claim |
| Keyboard shortcuts in the workspace: `/` opens filters, `g` focuses the grid, and `e` opens export. | 15 | J, unlisted claim |
| Privacy | 1 | — |
| There is no upload endpoint, account, analytics, advertising, or third-party runtime code. | 12 | J, unlisted claim |
| The service worker caches application assets only, never opened files or results. | 12 | J, unlisted claim |
| The active workspace disappears when the tab is closed or refreshed. | 11 | unlisted claim |
| See the in-product privacy page. | 5 | — |
| Develop | 1 | — |
| Requires Node.js 20 or newer. | 6 | — |
| Verify | 1 | — |
| To reproduce the large-file benchmark, run the production preview and the benchmark in separate terminals: | 15 | — |
| `GLASSLINE_BENCH_ROWS` controls the generated row count. | 8 | J |
| With the defaults plus 150 padding characters, the fixture is approximately 1 GB. | 13 | unlisted quantitative claim |
| Build and deploy | 3 | — |
| Deploy the contents of `dist/` as an Azure Static Web App. | 11 | J |
| `public/staticwebapp.config.json` supplies immutable asset caching and security headers, including the narrow CSP3 `wasm-unsafe-eval` allowance DuckDB-WASM needs to compile locally (not `unsafe-eval`). | 23 | L, J |
| DuckDB and the XLSX reader are bundled locally; the 34 MB query engine is fetched only after a user chooses a file. | 22 | J, unlisted quantitative claim |
| The matching DuckDB Parquet extension is also shipped as a same-origin, versioned asset and is requested only when a Parquet export is made—no data or extension request leaves the site. | 31 | L, J, unlisted claim |
| The initial application JavaScript is about 31 KB uncompressed. | 9 | unlisted quantitative claim |
| Practical limits | 2 | — |
| Browser and device memory still set the ceiling. | 8 | — |
| CSV/TSV is the right format for very large files; XLSX parsing materializes the first worksheet in memory and is best for smaller workbooks. | 23 | L, J |
| Glassline expects UTF-8 delimited text. | 5 | J, unlisted claim |
| Safari typically has a lower memory ceiling than Chromium browsers. | 10 | unlisted claim |
| Pivots intentionally cap distinct columns so an accidental high-cardinality field cannot freeze the interface. | 14 | J, unlisted claim |
| License | 1 | — |
| MIT © 2026 Sociobot (Param Factory). | 5 | — |

For the three over-limit sentences, verify and use these rewrites:

- Audience: **“For analysts who receive spreadsheet exports too large for Excel and need a quick answer.”**
- Parquet-extension detail: **“The Parquet extension loads only when you export Parquet.”**
- XLSX limitation: **“Use CSV or TSV for very large files. XLSX uses more browser memory.”**

## Claims and sandbox verification

`.factory/claims.json` is missing, so it contains zero listed tests to run. A fresh clone was created at `/tmp/bigcsv-review-VNek2o`; `npm ci`, `npm test`, and `npm run build` passed there. `npm test` reported 8 unit tests passed. Build output produced `dist/`.

No claim test could be run because no claim commands exist. The full end-to-end suite was not used as substitute evidence: it exercises a locally injected file rather than a shipped demo and is not tagged per claim. Offline and privacy interception were therefore **not verifiable through a demo**, because the required demo does not exist. A cold live landing request made only same-origin requests (`/`, the JS/CSS assets, and the hero AVIF), but that is not sufficient to establish the advertised whole-flow privacy claim.

## Structure and link checks

- Home: title, `lang`, one h1, `<main>`, SVG favicon, and meta description are present. The visual identity is product-specific (the dark glass/data-landscape treatment is consistent with `.factory/design.md`), not a generic SaaS template.
- Home metadata: canonical, Open Graph, Twitter-card, and Apple-touch metadata/assets are missing.
- `/privacy/` and `/terms/` return 200 and their home links work. They use the right title order (`Privacy — Glassline`, `Terms — Glassline`) but lack the common skeleton and metadata listed above.
- Home, Privacy, Terms, `robots.txt`, `sitemap.xml`, and `icon.svg` returned 200. `/demo` and the requested Apple touch icon returned 404. The sitemap has only home, privacy, and terms.
- Unknown route returns the generic Azure 404 described in the blocking finding.

## Required verification after repair

1. From a fresh browser context, open `/demo`; confirm visible realistic rows, banner, Reset, Start for real, and isolated storage. Intercept all requests while exercising filter, pivot, SQL, and export.
2. Run every command declared in the new `.factory/claims.json` from a clean clone. Each must pass and use `@claim:<id>`.
3. Crawl `/`, `/demo`, `/privacy/`, `/terms/`, and an unknown route. Assert metadata, route titles, header/footer, focus after route change, no dead links, and the custom 404.
4. Re-run mobile 390 px, keyboard, offline-demo, and axe checks after the above changes.
