# Verification handoff — PASS — 2026-08-28

## Independent verifier result

- Candidate verified: `88ea611652be1fff743e72c1cc83f21cb920b018`
- Production URL: <https://big-csv-browser-viewer.sociobot.in>
- **PASS — no known release-blocking defects.**

The independent evidence is in `.factory/verification-6.md`. Clean `npm ci`
(0 audit vulnerabilities), `npm test` (8/8), and `npm run build` all passed.
Local production and live production Playwright suites both passed 20/20,
covering desktop and 390 px mobile, CSV/TSV/XLSX, filters/sort/statistics,
group/pivot, SQL, CSV/Parquet export, malformed input, worker recovery, Axe,
and offline shell reload.

The fresh production preview opened and counted 5,000,000 rows / 1,012,961,173
bytes in 23.52 s, below the 30-second brief target. Live mobile Lighthouse
scored 94 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO.
Live artifact hashes match this candidate, requests remain same-origin only,
and headers, caching, CSP, and privacy boundaries pass review.

Re-run with:

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e
```

Known product limits: browser memory is the ceiling for very large files,
particularly Safari; XLSX materializes its first worksheet. These are
documented limits, not defects in the verified candidate.

## Previous repair context

## Release

- Base candidate: `14817075c5ef471c24e23cbf53de152d28d9f842`
- Repair commit: `f329579` — `fix: import CSV fields with quoted newlines`
- Production URL: <https://big-csv-browser-viewer.sociobot.in>
- Artifact/deployment: Vite + vanilla TypeScript static web app, deployed from `dist/` to the existing Azure Static Web App.

## What changed

The verifier's quoted-multiline CSV blocker is fixed at its root. `read_csv`
uses `null_padding` so irregular exports can retain their recovery workflow,
but DuckDB rejects that option in its parallel scanner when a valid quoted field
contains a physical line break. The streamed quote validator now reports that
condition while validating the same source bytes. Only valid CSVs with an LF or
CRLF inside a quoted field select DuckDB's compatible `parallel = false`
reader; ordinary large CSVs retain parallel import. Unterminated quotes and
unexpected text after a closing quote are still rejected before DuckDB opens
the file.

Regression coverage includes:

- unit checks for LF, CRLF, escaped quotes, malformed closing quotes, and
  unterminated quoted fields;
- production-header browser checks that open the verifier's exact fixture
  (`region,note\\nNorth,"first line\\nsecond line"\\nSouth,plain\\n`) and its
  CRLF variant in both desktop and 390 × 844 projects;
- the existing malformed-input recovery test, so accepting valid quoted
  newlines cannot weaken invalid-quote handling.

## Verification evidence

All checks were run from a clean `npm ci` installation (126 packages; `npm
audit` reported 0 vulnerabilities):

| Check | Result |
| --- | --- |
| Unit/integration | `npm test` — 8/8 passed |
| Type check and production build | `npm run build` passed; `dist/index.html` present |
| Local production browser suite | `npm run test:e2e` — 20/20 passed, serial DuckDB worker, desktop and 390 × 844 mobile |
| Live production browser suite | `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e` — 20/20 passed |
| Exact live quoted-newline probe | 390 px browser returned `2 rows`; import dialog closed; zero console/page errors; requests stayed on `https://big-csv-browser-viewer.sociobot.in` |
| Large-file target | `GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs` — 5,000,000 rows, 1,012,961,173 bytes, open + exact count in **15.63 s** (under 30 s) |
| Lighthouse | fresh local production mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; desktop: 100/100/100/100 |
| Accessibility | Axe serious/critical checks pass on landing and populated workspace in both browser projects; live smoke verified title, `lang=en`, one h1, main landmark, image alt text, labeled buttons, keyboard paths, reduced motion, and 44 px mobile targets |
| Offline/update | Browser suite reloads the cached shell offline; live `/sw.js` is `Cache-Control: no-cache` |
| Privacy | No upload endpoint, analytics, third-party runtime request, or remote font/script; live quoted-file probe observed same-origin requests only |
| Response policy | Live HTTPS response has HSTS, restrictive same-origin CSP with only `wasm-unsafe-eval`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, permissions policy, and strict-origin referrer policy; assets are immutable cached |
| Deployment identity | Live and local SHA-256 match for `index.html`, both entry JS chunks, and entry CSS; deployed root returned 200 |

The product remains local-first: selected `File` contents and generated
exports never leave the browser and are not cached by the service worker.

## How to verify or deploy

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e
```

Deploy the already-built `dist/` to the existing `sf-big-csv-browser-viewer`
Azure Static Web App. `public/staticwebapp.config.json` is copied into `dist/`
and supplies the production headers and caching policy.

## Known gaps / next steps

No release-blocking gaps remain. Quoted-newline CSVs use DuckDB's compatible
single-reader mode by necessity; normal files continue to use the parallel
reader and meet the 1 GB performance target. Browser/device memory limits and
the existing CSV/TSV-versus-XLSX guidance remain as documented in the README.
