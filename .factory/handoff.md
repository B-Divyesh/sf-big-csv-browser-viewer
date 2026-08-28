# Repair handoff — big-csv-browser-viewer-polish-1

Completed perfection-loop round 1 on August 28, 2026. All four blocking findings in `.factory/review-1.md` are resolved. The released static product remains Vite + TypeScript on Azure Static Web Apps.

## What changed

- Rewrote the first screen around the visitor’s job: **Filter large CSV files in your browser**, followed by a named analyst situation and clear sample/real-file actions.
- Added a one-click `?demo=1` path and equivalent `/demo` route. The real workspace opens a deterministic 40-row order file.
- Added the persistent demo banner, in-memory isolation, **Reset demo**, and **Start for real**. Details are in `.factory/demo.md`.
- Added `.factory/claims.json` with eight reliance claims and exactly one Playwright test tag for each claim.
- Verified demo isolation, same-origin privacy, offline reload, core analysis, CSV contents, Parquet metadata, supported formats, and 390 px controls.
- Added unique route titles, descriptions, canonicals, Open Graph/Twitter metadata, a 1200×630 social image, and a 180×180 touch icon.
- Added shared navigation, legal footers, `/demo` routing, route focus/announcement behavior, sitemap coverage, and a Glassline-designed production 404.
- Kept the luminous glass data-landscape identity and extended its mint scan-line grammar to the demo and legal routes.
- Corrected date cells that previously appeared as epoch-millisecond numbers.
- Rewrote README and legal copy, added `.factory/copy-audit.md`, and removed unbounded or untested row-limit wording.
- Updated `.factory/catalog-description.txt` to a 74-character verb-first sentence.
- Pinned Playwright to the worker-provided `1.58.2` release.

## Exact verification evidence

Final product/config commit: `83dea905bab4171fffba2f239a5ac2b840be732b` (repair implementation: `3cca84957f698d5abde1b7c304a3828fb0a3b3ad`).

Fresh remote clone: `/tmp/bigcsv-final-clean-Attu5v`, checked out at `83dea905bab4171fffba2f239a5ac2b840be732b`.

- `npm ci`: 127 packages installed; 0 vulnerabilities.
- Every command in `.factory/claims.json` ran separately: 8/8 passed.
  - `demo-sandbox`: 1 passed.
  - `local-processing`: 1 passed.
  - `offline-reload`: 1 passed.
  - `core-workflow`: 1 passed.
  - `csv-export`: 1 passed.
  - `parquet-export`: 1 passed.
  - `supported-file-formats`: 1 passed.
  - `mobile-controls`: 1 passed.
- `npm test`: 8/8 unit tests passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npm run test:e2e`: 30/30 passed across desktop Chromium and 390×844 mobile.
- Axe integration ran on landing, loaded workspace, Privacy, Terms, and 404. Serious/critical findings: 0.
- Privacy coverage intercepted filter, summary, SQL, and export requests; observed only the product origin.
- Offline coverage reloaded `?demo=1` with the network disabled and recovered all 40 rows.

Local production preview:

- `/opt/fleet/lib/verify-url.sh`: title present, `lang=en`, one h1, main present, 0 missing alt attributes, 0 unlabeled buttons, 0 console errors.
- Lighthouse mobile: performance 98, accessibility 100, best practices 100, SEO 100; LCP 1.6 s, CLS 0, total blocking time 140 ms.
- Initial JS: 34.66 KB uncompressed / 11.54 KB gzip. CSS: 20.94 KB / 5.39 KB gzip. Hero AVIF: 77.6 KB.

Production:

- Deployment ID: `2dda8dc2-511c-4874-8f77-fad2002bce87`.
- URL: <https://big-csv-browser-viewer.sociobot.in>
- `PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npm run test:e2e`: 30/30 passed in 3.1 minutes.
- Live `verify-url.sh`: HTTP 200, 963 ms load, correct title/lang/h1/main, 0 missing alt attributes, 0 unlabeled buttons, 0 console errors.
- Live routes: `/`, `/demo`, `/privacy/`, `/terms/`, social image, and touch icon return 200.
- Unknown route returns HTTP 404 with title `Page not found — Glassline`, h1 `This page has no rows.`, a home link, only same-origin requests, and 0 serious/critical axe findings.
- Production sends CSP, HSTS, Permissions-Policy, Referrer-Policy, `nosniff`, and `X-Frame-Options: DENY`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:claims
```

## Known gaps and next steps

No known blocking findings remain. Browser memory still determines the practical ceiling for unusually large files, as documented in README.
