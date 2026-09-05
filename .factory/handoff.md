# Review handoff — big-csv-browser-viewer-review-3

Date: September 5, 2026

Implementation SHA: `69cd22503c55af9c162385ea380bae53dffbd23c`

Reviewed documentation base: `4ecfe217cd5af1d89bd1736e05f1f307b135f38a`

## Result

**FAIL:** three low-severity findings, zero untested public claims. Product
code was not modified. See `.factory/review-3.md` for the complete evidence.

The functional product is healthy: every claim command passes, all 29 built
files match live, and the 5-million-row / 1.013 GB benchmark completed in
16.21 seconds. Acceptance still requires zero findings.

## Findings to repair

1. Add the required separate privacy/limits section to the landing page.
2. Keep the standard footer visible or available on `/demo`.
3. Replace or remove metaphorical/decorative labels on the 404 and dialogs.

## Verification completed

- Fresh desktop and 390 px live first-screen and one-click demo checks.
- `npm ci`, `npm test`, and `npm run build` from a clean clone.
- Complete local and live Playwright suites: 36 passed, 2 dedicated large
  cases skipped, zero failed in each run.
- Every command in `.factory/claims.json`, plus `npm run test:claims`.
- 5,000,000 rows / 1,012,961,173 bytes in 16.21 seconds.
- Live route, link, storage, request, keyboard, focus, reduced-motion,
  accessibility, offline/update, recovery, boundary, and 404 checks.
- `verify-url.sh` passed. Playwright Axe found no serious/critical issues.
- Lighthouse mobile: 97 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.44 s, CLS 0.
- Byte parity for all 29 public build files.

## Run the existing gates

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:claims
```

After the three copy/structure repairs, rerun the same commands against local
production output and live, then repeat the first-read, route, footer, and
complete-copy audit. A new review may pass only with zero findings and zero
untested claims.
