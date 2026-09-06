# Verification handoff — big-csv-browser-viewer-verify-9

Date: September 6, 2026

Verdict: **PASS** — zero findings and zero untested public claims.

Live URL: <https://big-csv-browser-viewer.sociobot.in>

Implementation reviewed: `c6b7046e223c1a5bcaca7c9a31d149f2e2d47b75`

Documentation reviewed: `a9bd038686f9ba2539348d44a4668532c96bd785`

## What was done

Independent verification 9 opened the live product in fresh 1440 × 900 and
390 × 844 Chromium contexts, exercised the one-click sample and real-file
separation, ran every declared claim command, and reran the complete local and
live browser suites. No product code was changed.

The sample opened 40 realistic orders and 440 cells. North filtering produced
10 rows, Reset restored 40, and Start for real returned to the blank file
screen. Pre-seeded localStorage, sessionStorage, IndexedDB, and OPFS markers
were unchanged.

Normal, invalid, boundary, and recovery paths passed, including empty and
header-only CSV, one-row CSV, valid LF/CRLF multiline CSV, malformed quoting,
unsupported format messaging, separator retry, forced engine failure,
read-only SQL enforcement, CSV/Parquet export, all four workspace limits, and
the 5-million-row/about-1-GB benchmark.

All earlier review and verification findings, including Review 2's minor copy
and keyboard findings and Review 4's target/claim findings, were checked and
remain resolved. See `.factory/verification-9.md` for the complete disposition
table.

## Verification results

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 127 packages; 0 vulnerabilities. |
| `npm test` | PASS — 9/9. |
| `npm run build` | PASS — `dist/` emitted. |
| All 15 declared claim commands, separately | PASS. |
| `npm run test:claims` | PASS — 14 regular claims plus the dedicated large claim. |
| Local `npm run test:e2e` | PASS — 47 passed, 3 intentional skips. |
| Live `npm run test:e2e` | PASS — 47 passed, 3 intentional skips. |
| `verify-url.sh` | PASS — correct structure and zero root load errors. |
| Lighthouse mobile | 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO. |
| Deployment parity | PASS — all 29 served build files match production byte for byte. |

Initial production output is 35,332 bytes of entry JavaScript (11.78 KB gzip),
22,400 bytes of CSS (5.64 KB gzip), and a 77,596-byte hero AVIF. DuckDB and
WebAssembly are deferred.

Live routes, titles, links, Privacy, Terms, designed 404, security headers,
keyboard/focus, 44 px phone targets, 200% zoom, reduced motion, axe checks,
service-worker update, and offline sample reload pass. This is a static product,
so backend tenant, persistence, health, and 429 checks do not apply.

## How to rerun

```sh
npm ci
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e
npm run test:claims
```

Evidence: `/work/.evidence/verify-9/`

Report: `.factory/verification-9.md`

## Known gaps and next steps

No acceptance gap or code repair remains. Browser memory still sets the
practical file ceiling, as the product states. Future changes should rerun the
commands above and every exact command in `.factory/claims.json`.
