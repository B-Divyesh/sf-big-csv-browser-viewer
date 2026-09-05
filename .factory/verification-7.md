# Independent verification 7 — PASS

**Date:** September 5, 2026  
**Implementation candidate:** `69cd22503c55af9c162385ea380bae53dffbd23c`  
**Documentation commit:** `31e3b3b6d5946c309d59f4ce2eecb23d11e1309f`  
**Live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Verdict

**PASS.** There are **zero findings** and **zero untested public claims**.

Glassline completes the stated job: analysts with files a spreadsheet cannot
open can open a local CSV, inspect it, filter, sort, group, pivot, query, and
export the filtered result without uploading it. The live deployment matches
the implementation candidate's built shell and entry assets byte-for-byte.
The documentation commit changes only the prior handoff report.

## First screen and one-click demo

Fresh Chromium desktop (1440 × 900) and phone (390 × 844) contexts were opened
at the live URL before scrolling. Both showed:

- Job: **“Open 5-million-row CSV files in your browser.”**
- Audience: **“For analysts with files a spreadsheet app cannot open…”**
- First action: **“Try it with sample data”**, with the result stated beside it:
  it opens 40 sample orders in the full CSV viewer.

In each fresh context, one click opened `sample-orders.csv` with **40 rows**
and populated cells (440 visible grid cells). The persistent banner read
**“Demo — sample data, nothing is saved”** and supplied **Reset demo** and
**Start for real**. Reset restored 40 rows. Start for real returned to the
blank file-opening screen. Local and session storage were empty in demo mode
and after leaving it. The phone document width remained 390 px. No console or
page errors were observed.

## Clean checkout gates

The checkout was clean at documentation SHA
`31e3b3b6d5946c309d59f4ce2eecb23d11e1309f`; its product source is
implementation SHA `69cd22503c55af9c162385ea380bae53dffbd23c`.

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci` installed 127 packages; audit reported 0 vulnerabilities. |
| Unit tests | PASS | `npm test`: 9/9 tests passed. |
| Production build | PASS | `npm run build` passed TypeScript checking and emitted `dist/`. |
| Full local browser suite | PASS | `npm run test:e2e`: 38 desktop/390 px cases, final Playwright run status `passed`. |
| Full live browser suite | PASS | `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e`: 38 cases, final status `passed`. |
| URL smoke check | PASS | `verify-url.sh` found HTTP 200, title, `lang=en`, one h1, main, image alt text, labelled buttons, and zero browser errors. |

The standalone `@axe-core/cli` could not start because its ChromeDriver does
not support the supplied Playwright Chromium. This is not an untested
accessibility claim: the full local and live suites use the installed
`@axe-core/playwright` integration on landing, populated workspace, both
legal routes, and 404. Those checks reported no serious or critical
violations.

## Declared claims

Every command in `.factory/claims.json` was run separately after the clean
install. All eleven claim IDs occur exactly once as `@claim:<id>` tests.

| Claim ID | Declared command result |
| --- | --- |
| `demo-sandbox` | PASS — one desktop test passed. |
| `local-processing` | PASS — one desktop test passed. |
| `offline-reload` | PASS — one desktop test passed. |
| `core-workflow` | PASS — one desktop test passed. |
| `csv-export` | PASS — one desktop test passed. |
| `parquet-export` | PASS — one desktop test passed. |
| `supported-file-formats` | PASS — one desktop test passed. |
| `mobile-controls` | PASS — one desktop test passed. |
| `real-file-storage` | PASS — one desktop test passed. |
| `import-recovery` | PASS — one desktop test passed. |
| `large-file` | PASS — `npm run test:large-file` passed; it generated a 1,012,961,173-byte local CSV and enforced the 30-second open-and-count limit. |

The separate production-preview benchmark,
`GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs`,
opened and exact-counted 5,000,000 rows / 1,012,961,173 bytes in **16.18
seconds**, inside the stated 30-second Chromium environment limit.

The copy audit and public pages were cross-checked against the claim inventory.
All reliance statements about the sample, local processing, offline behavior,
formats, storage, recovery, controls, exports, and the 5-million-row benchmark
map to a declared claim. No unlisted public claim was found.

## Product and recovery paths

The complete browser suites cover normal CSV use; sorting; filters; column
profile; group summary; pivot; read-only SQL; CSV and typed Parquet download;
CSV, TSV, TXT, and first-sheet XLSX import; malformed quote recovery; separator
retry; quoted multiline LF and CRLF CSV; engine-start recovery; offline reload;
route focus; and 390 px controls.

The live suite also confirms the previous failure paths are now safe:

- The valid quoted-multiline CSV regression opens as rows instead of being
  rejected.
- Unterminated CSV quoting presents import controls.
- Parquet produces a download whose footer reports 10 filtered rows and 11
  fields.
- The four visible workspace actions meet 44 × 44 px targets with at least
  8 px separation at 390 px.
- Invalid modifying SQL is rejected while a read-only query succeeds.
- The first Tab reaches the visible skip link; route changes focus and announce
  their h1; keyboard shortcuts and reduced-motion behavior are covered.

## Routes, privacy, and deployment

| Check | Result |
| --- | --- |
| `/`, `/demo`, `/privacy/`, `/terms/` | PASS — HTTP 200, route titles and shared navigation work. |
| Unknown route | PASS — HTTP 404 with the designed Glassline page; this intentional status is expected. |
| Links | PASS — all collected internal, hash, demo, legal, and Param Factory links resolved successfully. |
| Privacy | PASS — demo request capture allowed only the product origin; real-file storage regression confirms selected files and exports are absent from web stores and disappear after refresh/close. |
| Offline/update | PASS — service-worker offline sample reload is covered in the live suite; `sw.js` is no-cache and the shell is versioned. |
| Security headers | PASS — same-origin CSP, HSTS, nosniff, DENY framing, strict referrer policy, and restrictive permissions policy are live. |
| Backend checks | Not applicable — this is a static local-first app with no backend, tenant, database, health, or rate-limit surface. |

Built and live SHA-256 values matched for `index.html`, the entry script,
entry CSS, `sw.js`, sample file, Privacy, Terms, and 404. In particular:

- `index.html`: `60e6b7fd7d20fb6c5ca276f84d16e4846c2b1a4105ed08b2fdc3bf9fc28b91f4`
- `assets/index-BwFDfBSE.js`: `1a9a212029473155c176bbf7bdb5841022f0f84101313c155d8c4e449639c10b`
- `assets/index-DXTj45fr.css`: `09d6720b2e452d4d618e79c178da4291f1bad2321d33a597b0a0dfd69f55539f`

Initial shell assets remain within the static budget: entry JavaScript is
34.97 kB (11.64 kB gzip), CSS is 21.07 kB (5.42 kB gzip), and the 77.6 kB
hero AVIF is self-hosted. DuckDB assets are deferred until a file is opened.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1: missing sample sandbox, claims, audience first screen, and designed 404 | Resolved and directly rechecked above. |
| Review 1: metadata, shared route skeleton, copy, and picker wording | Resolved; live route, metadata, link, copy, and keyboard coverage passes. |
| Review 2 F-2-1 through F-2-4: unlisted large-file, storage, recovery, and deployment claims | Resolved: those claims are declared, tagged once, and their declared commands passed. |
| Review 2 F-2-5: route focus | Resolved: home, demo, legal, and 404 focus/announcement tests pass. |
| Review 2 F-2-6 through F-2-14: plain wording and duplicate picker stop | Resolved: current first-screen copy is direct and the picker regression passes. |
| Verification 1: default parallel browser instability and malformed-input recovery | Resolved: serial configuration is explicit; full command passes and malformed CSV has recovery. |
| Verification 3: Parquet export | Resolved: live typed Parquet download is parsed by the claim test. |
| Verification 4: 42 px mobile controls | Resolved: live 390 px target and spacing claim passes. |
| Verification 5: valid quoted multiline CSV | Resolved: LF and CRLF multiline fixtures are live-suite regressions. |
| Verification 6: no findings | Retained: independently reconfirmed. |

## Findings

- Critical: none
- High: none
- Medium: none
- Low: none
- Untested claims: none

