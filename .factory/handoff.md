# Review handoff — big-csv-browser-viewer-review-4

Date: September 5, 2026

Implementation reviewed: `4ee27d9939db87bf3f013477090ef9d288c72eda`

Documentation reviewed: `3572325989d5149b5327b016df16434c4866fd80`
Live URL: <https://big-csv-browser-viewer.sociobot.in>

## Result

**FAIL — 2 medium findings and 6 public claims without adequate automated
proof.** No product code was changed and nothing was deployed.

The live product still completes its main job. Fresh desktop and phone sessions
showed a clear job, audience, and first action. One click opened 40 realistic
orders and 440 cells. Filter, reset, blank real-data exit, and preservation of
pre-existing localStorage, sessionStorage, IndexedDB, and OPFS markers passed.

The failures are contract gaps:

1. Several live phone targets are below 44 px, including sortable headers,
   filter controls, analysis tabs, the wordmark, and footer links. The declared
   mobile test checks only four top-toolbar actions.
2. Five visible statements about the 100-row window, filtered-profile scope,
   group/pivot limits, SQL limit, and smaller Parquet output are missing from
   `.factory/claims.json`.

See `.factory/review-4.md` for measurements, claim evidence, and every earlier
finding's disposition.

## Verification completed

- Clean `npm ci`: 127 packages, 0 audit vulnerabilities.
- `npm test`: 9/9 passed.
- `npm run build`: passed and emitted `dist/`.
- Local browser suite: 40 passed, 2 dedicated-large cases skipped.
- Live browser suite: 40 passed, 2 dedicated-large cases skipped.
- All 11 declared claim commands were run separately. Ten regular commands
  passed. A newly generated 5,000,000-row, 1,012,961,173-byte file passed the
  dedicated under-30-second assertion.
- `verify-url.sh`: passed.
- Live Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.42 s, TBT 135 ms, CLS 0.
- All 29 deployment-served build files matched live byte for byte.
- Live routes, intentional 404, keyboard and focus, reduced motion,
  service-worker update, offline reload, privacy requests, normal inputs,
  invalid inputs, boundaries, and recovery paths were checked.

## Required next work

- Raise every interactive target to at least 44 × 44 CSS px at 390 px and
  expand the mobile regression beyond the four toolbar buttons.
- Add claim entries and outcome tests for all five statements in R4-M2, or
  remove the statements. Define the dataset for any retained Parquet size
  comparison.
- Re-run every declared command, the complete local and live suites, target
  measurements, URL verification, and Lighthouse after repair.

## Evidence

The report is `.factory/review-4.md`. Supporting files are under
`/work/.evidence/review-4/`. The required copies are
`/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.
