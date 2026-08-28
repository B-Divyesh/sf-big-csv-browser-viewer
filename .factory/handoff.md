# Review handoff — big-csv-browser-viewer-review-1

Completed an adversarial, read-only product review. No product source, configuration, or deployment files were changed.

Created `.factory/review-1.md` with a `FAIL` verdict. Confirmed blockers are: no sample-data demo/sandbox, no claims inventory or per-claim tests, no named user on the cold first screen, and a generic Azure production 404.

Verification performed:

- Fresh live browser contexts at 390 × 844 and 1440 × 900: page loaded without console errors; 390 px page width was 390 px.
- Checked `/demo`, `?demo=1`, privacy, terms, metadata, sitemap, robots, favicon, external production 404, and all site links exposed on the landing page.
- Fresh clone at `/tmp/bigcsv-review-VNek2o`: `npm ci`, `npm test` (8 passed), and `npm run build` (passed, produced `dist/`).
- Could not run claim tests because `.factory/claims.json` does not exist. Offline/privacy sandbox testing is not possible through the required demo entry because it does not exist.

Follow the repair/verification checklist in `.factory/review-1.md` before requesting another acceptance review.
