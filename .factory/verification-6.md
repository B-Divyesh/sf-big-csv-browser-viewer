# Independent verification 6 — PASS

**Date:** 2026-08-28  
**Candidate:** `88ea611652be1fff743e72c1cc83f21cb920b018`  
**Live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Verdict

**PASS.** The live static web app matches the candidate's published artifacts
and completes the researched job: local CSV/TSV/XLSX opening, virtual viewing,
typed filters and sorting, column statistics, group/pivot, read-only SQL, and
filtered CSV/Parquet export. It remains local-first. The valid
quoted-multiline CSV blocker from verification 5 is fixed: LF and CRLF
RFC-style fixtures open on desktop and 390 px mobile while malformed quotes
still show recovery controls.

No product source was modified by this verifier.

## Reproducible gates

The checkout was clean and at the requested SHA before installation. `npm ci`
installed 126 packages and reported 0 audit vulnerabilities. Playwright 1.62.1
needed its matching Chromium installed with `npx playwright install chromium`.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| Unit/integration | PASS | `npm test`: 2 files, **8/8** tests passed. |
| Type/lint | PASS / N/A | `npm run build` runs `tsc --noEmit`; no separate lint script exists. |
| Exact production build | PASS | `npm run build` completed and emitted `dist/`. |
| Local production browser suite | PASS | `npm run test:e2e`: **20/20** passed in 1.7 min, desktop and 390 × 844 mobile. |
| Live production browser suite | PASS | `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e`: **20/20** passed in 1.8 min. |
| Accessibility | PASS | Axe on landing and workspace in both projects found zero serious/critical issues. |

## End-to-end evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| Normal CSV | PASS | Opens 4 rows; filters North to 2; group summary, pivot, SQL, and filtered CSV export complete. |
| CSV boundary/recovery | PASS | LF and CRLF quoted-multiline files open as 2 rows. Unterminated quotes show import recovery; forced worker failure shows retry guidance. |
| TSV/XLSX | PASS | Full suite opens a TSV and first worksheet of generated XLSX in desktop and mobile. |
| Parquet | PASS | Filtered export is parsed: 2 rows, 4 fields, 1 row group. |
| Invalid SQL/recovery | PASS | Independent live run rejects `DELETE FROM data`, then runs `SELECT COUNT(*)` and returns 4. |
| Column statistics | PASS | Independent live run returns filled, distinct, minimum, and maximum values. |
| Mobile/keyboard | PASS | 390 px toolbar controls are at least 44 × 44 px with 8 px gaps and no overflow. `/`, `g`, and `e` are covered; Tab reaches a visible skip link with solid 3 px focus. |
| Reduced motion | PASS | Live drop-zone transition is `1e-05s` under `prefers-reduced-motion: reduce`. |
| Console/page errors | PASS | Independent normal/import/statistics/SQL run recorded zero console and page errors. |
| Offline/update | PASS | The suite reloads cached shell offline. `sw.js` is no-cache, calls `skipWaiting`, and removes prior named caches on activation. |

## Performance and bundle evidence

```sh
GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs
# {"rows":5000000,"bytes":1012961173,"openAndCountSeconds":23.52}
```

The 5,000,000-row / 1.013 GB CSV meets the brief's 30-second target in this
verifier environment. Build output: shell JS 32,077 B (10,790 B gzip), CSS
19,113 B (5,080 B gzip), AVIF hero 77,596 B, and WebP hero 141,050 B. The
197,794 B engine chunk and DuckDB WASM are deferred until a file is chosen;
initial JS and CSS are within the 200 KB and 50 KB budgets.

Fresh live mobile Lighthouse 12.8.2: **94 Performance, 100 Accessibility,
100 Best Practices, 100 SEO**; LCP 1,511 ms, CLS 0, Speed Index 1,061 ms.

## Deployment parity, privacy, and policies

Deployment parity is **PASS**. `index.html` SHA-256 matches at
`7e914b2f56895abe6f7f52da84a544c8c4b1c294ee7e5a3c019110a5229aa9be`.
All published `dist/` files also matched live by SHA-256; the non-public
deployment configuration file correctly returns 404. Live HTML points to the
same `index-DbkY84O2.js` and `index-9bc9aeQM.css` as the candidate.

Live HTTPS returns HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options:
nosniff`, strict-origin referrer policy, restrictive permissions policy, and
a same-origin CSP with only the needed `'wasm-unsafe-eval'`. `/assets/*` and
`/duckdb-extensions/*` are immutable for one year; `/sw.js` is no-cache.

Static inspection found no upload endpoint, analytics, advertising, tracker,
remote font, remote script, or CDN runtime dependency. An independent live
file-import/SQL run observed one request origin only:
`https://big-csv-browser-viewer.sociobot.in`. File contents and generated
exports were not requests. The service worker caches same-origin GET assets.
`/privacy/` and `/terms/` return 200 with title, language, main, and h1.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

This static web product has no library/CLI consumer package, backend,
persistence boundary, payment workflow, or health endpoint; those checks do
not apply.
