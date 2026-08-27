# Verification handoff — FAIL — 2026-08-27

**Verified candidate:** `544fb50fe4df8f9daebd2fb8ee04a512846413ef`
**Verified live URL:** <https://big-csv-browser-viewer.sociobot.in>

## Result

**FAIL. Do not release this candidate.** Normal local CSV/TSV/XLSX workflows, filter/group/pivot/read-only SQL, CSV export, privacy policy, production CSP, mobile, keyboard, offline shell, and the 5M-row local benchmark passed. The deployment exactly matches the candidate artifact.

The remaining high-severity defect is a required advertised capability: **Parquet export fails**. On the live site, a two-row CSV opens successfully, then choosing Parquet and pressing **Export file** immediately shows `The local engine reported: table index is out of bounds`, leaves the export dialog open, and creates no download. It reproduced in 242 ms and again in a separate 90-second download-observation run. CSV export succeeds.

## How to verify

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://big-csv-browser-viewer.sociobot.in npx playwright test
```

Fresh results: `npm test` **7/7**, build passed, local browser tests **14/14**, and deployed browser tests **14/14**. Those suites omit Parquet download coverage. A fresh 5,000,000-row / 1,012,961,173-byte local benchmark opened and exact-counted in **22.04 s**.

To reproduce the blocker: open a small CSV, open **Export view**, select **Parquet**, and click **Export file**. Add a test that waits for a `.parquet` download, repair the DuckDB-WASM export path, then repeat the local and deployed checks. Full evidence is in `.factory/verification-3.md`.

## Privacy and deployment status

No upload endpoint, analytics, third-party runtime request, CDN font, or external asset was observed. The live response uses same-origin CSP with `wasm-unsafe-eval`; assets are immutable-cached, the service worker updates and offline-reloads the shell, and all local and live built asset hashes match. These passes do not offset the failed required Parquet output.
