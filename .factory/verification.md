# Independent verification — FAIL

**Verifier:** factory verifier  
**Date:** 2026-08-27  
**Candidate:** `373dba1cc21d02b9038f648a1ad8828e8862c21d` (`main`)  
**Live URL:** `https://big-csv-browser-viewer.sociobot.in`

## Verdict

**FAIL.** The deployment is the requested candidate and most of the core workflow works, including the 5M-row/1 GB benchmark. It cannot be accepted against the work order because:

1. The documented end-to-end command, `npm run test:e2e`, fails in a clean environment after its declared Chromium dependency is installed. With its configured two workers, concurrent DuckDB-WASM initialization crashes a page; all eight tests then fail. The same suite only passes when manually forced to `--workers=1`.
2. An unterminated quoted CSV is accepted into a workspace without the import-error/recovery UI. This silently treats malformed input as data, contrary to the brief's CSV quoting/encoding edge-case constraint and the product claim that inconsistent CSV structure is detected with recovery controls.

No product source was changed during this verification.

## Repository and build evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity | PASS | `git rev-parse HEAD` returned `373dba1cc21d02b9038f648a1ad8828e8862c21d`; worktree was clean before verification. |
| Clean dependency install | PASS | `npm ci`: 127 packages installed; `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities. |
| Unit suite | PASS | `npm test`: 1 file, 4/4 tests passed. |
| Production build | PASS | `npm run build`: TypeScript check and Vite build completed; `dist/` produced. |
| Default e2e suite | FAIL | After `npx playwright install chromium`, `npm run test:e2e` used two workers. Both CSV-load pages crashed during DuckDB startup (`Protocol error … Page crashed`); all 8 tests failed. A clean `npm ci` alone also lacks the required browser executable, so the command initially fails before any app test. |
| Isolated e2e suite | PASS, non-default | `npx playwright test --workers=1`: 8/8 passed (desktop and 390×844 mobile), including landing/workspace axe serious/critical checks, CSV flow, XLSX, offline shell, filter/group/pivot/SQL, and CSV download. This does not cure the default-command failure. |

## Core workflow and stress evidence

| Area | Result | Exact observation |
| --- | --- | --- |
| 5M-row, 1 GB CSV | PASS | `GLASSLINE_BENCH_ROWS=5000000 GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs`: 5,000,000 rows, 1,012,961,173 bytes, selection through first workspace and exact count **12.82 s**. This is below the brief's 30 s target in this container. |
| 5M-row representative CSV | PASS | Same benchmark with padding 0: 262,961,173 bytes in **6.77 s**. |
| Quoted/multiline representative CSV | PASS | Existing serial e2e CSV exercise completed with filtering, group, pivot, read-only SQL, and CSV export; standard quoted CSV handling is provided by DuckDB's reader. |
| Malformed quoting | FAIL | File `id,name\n1,"unclosed\n2,still here\n` showed `#error-dialog.open === false` and exposed the workspace's **Open another file** control, proving the malformed source was accepted instead of producing the documented import-recovery state. |
| UTF-16 encoding | PASS (honest limit) | UTF-16LE/BOM CSV opened the import error dialog (`#error-dialog.open === true`), consistent with the stated UTF-8-only limitation and recovery guidance. |
| Virtualization, jump, search, sort | PASS | A 1,000-row × 3-column CSV rendered exactly 300 grid cells (100 visible data rows); jump to row 501 rendered that row header. Sorting `amount` produced ascending values, and column search returned one `amount` match. |
| Cancellation | PASS | Cancelling a 50,000-row load returned to landing; `workspace === false` and `error-dialog.open === false` after two seconds. |
| Exports | PASS | Serial e2e verified CSV download. Independent 1,000-row test downloaded `glassline-export-2026-08-27.parquet`. |

## Accessibility, responsive, and performance evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Desktop and 390 px | PASS, serial | The 8/8 serial Playwright suite covered desktop and a 390×844 mobile project. |
| Keyboard-only | PASS | `/` opened filters, `Escape` closed them, `g` focused `#grid-scroll`, and `e` opened export after a CSV loaded. |
| Reduced motion | PASS | With `page.emulateMedia({ reducedMotion: 'reduce' })`, `.drop-zone` computed transition duration was `1e-05s`; the stylesheet has a global reduced-motion override. |
| Axe | PASS, serial | Landing and populated workspace had zero serious or critical violations in the shipped Playwright axe checks. |
| Lighthouse (local production preview) | PASS | Lighthouse: Performance **99**, Accessibility **100**; FCP **1.0 s**, LCP **1.7 s**, CLS **0**, TBT **130 ms**. Command used Playwright Chromium with `--headless --no-sandbox --disable-dev-shm-usage`. |
| Initial budget | PASS | Initial application JS `index-fwUVchb5.js`: 31,414 B (10,590 B gzip); CSS: 19,157 B (5,090 B gzip); AVIF hero: 77,596 B. All are within the 200 KB JS / 50 KB CSS / 300 KB hero limits. The 34.2 MB DuckDB WASM and 194,646 B engine chunk are deferred until file selection. |

## Live deployment, privacy, and cache evidence

The Standard-tier URL served the candidate at verification time. SHA-256 comparisons were identical for the live and local build copies of:

- `/` (`97279edbafc15cafd138f929b5de338732fbefc3b89398b4af87db757687a634`)
- `/assets/index-fwUVchb5.js` (`6eca2e3af0443e460e03cf910aa08288d0bf1350c6d87ccbca0c0ca037f4e31c`)
- `/assets/index-03uCR57l.css` (`dbb0d0b1d54a713cf3075775a04e1e2b0900c0f2460f551c8d79a79ac04300a1`)
- `/assets/engine-gOo_-6f3.js` (`73250ecfca239d7678a154845d6c1c35c9993eec32acbad5c476c876b431097e`)
- `/sw.js` (`03cbd4ce7f87a7ea4e2a7fb36aeb5b4e8746477eca6d21399c4c43d2b808d99b`)
- `/manifest.webmanifest` (`5b77f19c0a598b3f4e76306e38f52431207c00b17402d98c737acea45936856e`)

Live headers included HSTS, CSP restricting `default-src`, scripts, connections, workers and images to `'self'` (plus `data:` images and `blob:` workers), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and the declared Permissions-Policy. Hashed `/assets/*` had `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` had `no-cache`.

Static/runtime inspection found no analytics, upload endpoint, CDN font, or third-party runtime request. The service worker caches same-origin shell/assets only; it receives browser performance resource URLs, not `File` contents or query results. `/privacy/` and `/terms/` are served and the app states the UTF-8 and local-processing limits.

## Required remediation before re-verification

1. Make `npm run test:e2e` reliable as written (for example, serialize DuckDB-heavy tests or isolate engines) and ensure its browser prerequisite is unambiguous/automated for clean CI.
2. Reject or explicitly quarantine malformed quoted records, preserving row-level diagnostics and offering the existing retry controls. Add a regression test for unterminated quotes and inconsistent quote structure.
3. Re-run the full default test command plus malformed-input tests after the above changes; only then reconsider a PASS.
