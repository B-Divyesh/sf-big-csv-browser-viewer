# Open large CSV files locally — verification 8

**Verdict: PASS**

Verified September 5, 2026 against <https://big-csv-browser-viewer.sociobot.in>.
There are **zero findings** of every severity and **zero untested public claims**.

Implementation reviewed: `4ee27d9939db87bf3f013477090ef9d288c72eda`.
Documentation reviewed: `81e81088eb435e5c1bb0b2575bde159e394c7233`.
The later commit changes only `.factory/handoff.md`, so the live product image
is correctly assessed against `4ee27d9`.

## Job, audience, and first action

On fresh live desktop (1440 x 900) and phone (390 x 844) pages, before any
scrolling, the first screen said:

- Job: **Open 5-million-row CSV files in your browser.**
- Audience: analysts with files a spreadsheet app cannot open.
- First action: **Try it with sample data**, with the result stated beside it:
  it opens 40 sample orders in the full CSV viewer.

The job, audience, and action are direct, in plain words, and visible in both
viewports. Captures are in `/work/.evidence/verify-8/desktop-first-screen.png`
and `/work/.evidence/verify-8/phone-first-screen.png`.

## Fresh live demo and product paths

Fresh desktop and phone contexts each opened the sample in one click. The
populated viewer displayed `sample-orders.csv`, 40 rows, and 440 grid cells.
The persistent label read **Demo — sample data, nothing is saved**, with
**Reset demo** and **Start for real**. Reset restored 40 rows. Starting for
real returned to the blank file-opening screen; the banner and workspace were
hidden and local/session storage remained empty. Phone document width stayed
390 px. No console or page errors occurred.

The full live browser run passed **40 tests** across desktop and phone; its two
dedicated large-file instances were intentionally skipped because the large
claim has its own documented command. That command was run separately below.
The browser suite covers normal CSV, TSV, TXT, XLSX first worksheet, numeric
and quoted-multiline boundaries, invalid CSV, separator retry, forced engine
failure/retry, CSV and typed Parquet downloads, filter/group/pivot/read-only
SQL, statistics, keyboard shortcuts, focus, reduced motion, offline reload,
service-worker update, route focus, legal routes, and the designed 404.

There is no backend for this static product, so tenant isolation, persistence,
health, and 429 checks do not apply.

## Clean-checkout gates

`npm ci` completed from the clean checkout (127 packages; 0 audit
vulnerabilities).

| Check | Result |
| --- | --- |
| `npm test` | PASS — 9/9 tests. |
| `npm run build` | PASS — TypeScript check passed and `dist/index.html` was produced. |
| `npm run test:e2e` | PASS — 40 passed, 2 dedicated-large instances skipped, 0 failed. |
| `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e -- --reporter=line` | PASS — 40 passed, 2 dedicated-large instances skipped, 0 failed in 3.8 minutes. |
| `/opt/fleet/lib/verify-url.sh <live-url> /work/.evidence/verify-8/url` | PASS — HTTPS 200, correct title and language, one rendered h1, main, complete image/button labels, zero console errors. |
| Live Lighthouse mobile | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 50 ms, CLS 0. |

Production build output has a 35.33 kB main entry JavaScript file (11.78 kB
gzip), 22.18 kB CSS (5.62 kB gzip), and deferred DuckDB files. No third-party
font or script is needed for first load.

`npx @axe-core/cli` could not locate a system Chrome in this container. This is
not an untested claim: the permitted Playwright Axe integration ran in the
passing local and live browser suites on landing, populated workspace, Privacy,
Terms, and 404, in both projects, with zero serious or critical violations.

## Declared claims

Every command in `.factory/claims.json` was run separately from the clean
install. Each claim ID occurs exactly once in `tests/app.spec.ts`.

| Claim | Result and observable evidence |
| --- | --- |
| `demo-sandbox` | PASS — one test; 40 orders, reset, no account/storage, and blank real exit. |
| `local-processing` | PASS — one test; full demo workflow makes only same-origin requests. |
| `offline-reload` | PASS — one test; cached sample reloads offline after first visit. |
| `core-workflow` | PASS — one test; sort, filter, profile, group, pivot, and read-only SQL produce results. |
| `csv-export` | PASS — one test; the North filter produces the original header plus 10 matching rows. |
| `parquet-export` | PASS — one test; downloaded Parquet has 10 rows, 11 typed fields, and one row group. |
| `supported-file-formats` | PASS — one test; CSV, TSV, TXT, and XLSX first worksheet open. |
| `mobile-controls` | PASS — one test; 390 px targets meet 44 px and 8 px spacing, `/`, `g`, and `e` work. |
| `real-file-storage` | PASS — one test; selected file/export leave no browser-store marker, requests are same-origin GETs only, no socket opens, refresh/close clears the workspace. |
| `import-recovery` | PASS — one test; a separator mismatch retries successfully with the selected separator. |
| `large-file` | PASS — `npm run test:large-file` generated a 5,000,000-row file exceeding 1 GB and opened/counts it in **18.8 seconds**, below 30 seconds. |

The live copy, README, privacy/terms pages, demo banner, and 404 were
cross-checked against the inventory. All visitor-reliance statements map to a
listed claim or are a non-promissory legal limitation. No unlisted public claim
was found.

## Accessibility, privacy, routes, and recovery

- Keyboard navigation has the skip link, visible mint focus ring, operable
  dialogs, focus return, and no observed trap. `/`, `g`, `e`, Escape, browser
  back/forward focus, and route announcements are covered by the live suite.
- Reduced-motion coverage passes. The 390 px workspace has no horizontal
  overflow. The independent fresh phone run measured `scrollWidth === 390`.
- The service-worker offline reload and update path pass in the live suite.
  The public sample cache is scoped to the shell/sample; selected real files
  and exports are not stored.
- `/`, `/demo`, `/privacy/`, `/terms/`, robots, sitemap, and manifest returned
  200. `/demo` rendered title **Demo — Glassline**, one h1, and the standard
  footer. An intentional unknown URL returned HTTP 404 with **Page not found**,
  recovery links, and a product-styled page; that expected 404 is not a defect.
- Root responses provide same-origin CSP with WebAssembly support, `nosniff`,
  denied framing, restrictive permissions policy, and strict referrer policy.
  The local-processing and real-file-storage claim tests independently prove
  no upload behavior through their request captures.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1: missing demo, claim inventory, audience, designed 404 | Resolved and freshly rechecked through the first-screen and one-click demo evidence above. |
| Review 1: copy, metadata, skeleton, and vague controls | Resolved; current visible copy is direct, route metadata/skeleton pass, and labelled controls work by keyboard. |
| Review 2 F-2-1 through F-2-4: unlisted size, storage, recovery, deployment claims | Resolved; all are listed and each declared command passed. |
| Review 2 F-2-5: route focus | Resolved; home/demo/legal/404 focus and polite announcements pass. |
| Review 2 F-2-6 through F-2-14: wording, format naming, privacy terms, and duplicate picker stop | Resolved; demo says Start for real, formats are named, visitor wording is plain, and picker regression passes. |
| Verification 1: serial stability and malformed input | Resolved; one worker is configured and malformed input has visible recovery. |
| Verification 2: production CSP blocked DuckDB-WASM | Resolved; live CSV/TSV/XLSX and core workflows pass with zero console/page errors. |
| Verification 3: Parquet download failure | Resolved; the claim test parses a valid filtered Parquet download. |
| Verification 4: 42 px mobile actions | Resolved; current 390 px test verifies at least 44 px targets and 8 px gaps. |
| Verification 5: valid quoted multiline CSV rejected | Resolved; live desktop and phone regressions open LF and CRLF quoted multiline files. |
| Verification 6: no defects | Retained; independently reconfirmed. |
| Verification 7: no defects | Retained except for the later strict-review items below, which are also resolved. |
| Review 3 R3-L1: absent privacy and limits section | Resolved; live landing has the section after task steps. |
| Review 3 R3-L2: `/demo` hid footer | Resolved; direct `/demo` retains its standard footer. |
| Review 3 R3-L3: decorative dialog/404 labels | Resolved; dialogs and 404 use literal task/recovery headings. |

## Evidence

Evidence is under `/work/.evidence/verify-8/`, including fresh desktop and
phone first-screen/demo captures, URL smoke output, and the live Lighthouse
JSON. This report is also copied to `/work/.evidence/qa-report.md`.
