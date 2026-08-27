# Glassline v1 handoff

## What shipped

- A finished Vite + vanilla TypeScript static application with a product-specific “luminous glass data landscape” system documented in `.factory/design.md`.
- Local CSV/TSV/TXT ingestion through DuckDB-WASM browser file handles, with delimiter/header/all-text recovery controls and no upload path.
- XLSX ingestion using a dynamically loaded, vulnerability-free parser; the first worksheet is converted locally for DuckDB.
- A dense virtual data grid with a fixed 100-row DOM window, direct row jumping, column search, typed sorting, filter chips, and per-column statistics.
- Multi-condition typed filters, grouped aggregates, a bounded simple pivot builder, and a read-only SQL console.
- Full filtered-view CSV and Parquet exports created by DuckDB in the browser.
- First-class landing, loading, empty-result, parse error, offline, responsive, and keyboard states.
- PWA shell/runtime caching, privacy and terms pages, security/cache headers for Azure Static Web Apps, robots and sitemap files.
- Original generated hero art in `assets/src/` with prompt/model provenance; shipped as 76 KB AVIF and 138 KB WebP.

## How to run

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The deployment command is exactly `npm run build`. Output is `dist/`, with `dist/index.html` at its root.

## Verification performed on 2026-08-27

- `npm test`: 4/4 unit tests passed.
- `npm run build`: passed; reproducible Vite output in `dist/`.
- `npm run test:e2e`: 8/8 passed across desktop Chromium and a 390×844 mobile Chromium viewport. Coverage includes CSV load, exact count, typed filtering, group, pivot, read-only SQL, CSV export/download, XLSX load, first-visit offline shell reload, console-error capture, and axe checks of both landing and populated workspace.
- Lighthouse mobile production build: **Performance 100, Accessibility 100, Best Practices 100, SEO 100**. FCP 0.9 s, LCP 1.8 s, CLS 0, TBT 10 ms.
- Initial payload: 31.0 KB JS (10.4 KB gzip), 19.2 KB CSS (5.1 KB gzip), 76 KB AVIF hero. DuckDB is deliberately deferred until file selection; the selected browser downloads one ~34 MB WASM engine.
- Large-file benchmark: generated 5,000,000-row, 1,012,961,173-byte CSV; time from file selection through first grid render and exact row count was **8.42 seconds** in this worker container. A 263 MB/5M-row variant measured 5.35 seconds. Command: `GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs` while preview runs on port 4173.
- `npm audit`: 0 vulnerabilities.
- Generated image reviewed at source resolution: no brand, watermark, people, or readable text artifacts.

## Known limits and honest deviations

- XLSX must be decompressed and converted in browser memory and is therefore slower and more memory-hungry than CSV; only the first worksheet is opened.
- Delimited text is expected to be UTF-8. A delimiter can be forced, but legacy encodings are not transcoded.
- Browser memory policies differ; Safari will usually fail sooner than desktop Chromium on multi-GB files.
- The CSV path uses DuckDB’s direct browser file reader instead of copying the source into OPFS. This preserves streaming/random reads without doubling local storage; active work is intentionally not persisted.
- Filters are combined with AND in v1. Pivots expose at most 20 distinct columns and summaries return at most 500 rows to protect the UI.
- Lighthouse numbers measure the landing shell. File-open speed depends on disk, browser, CPU, and the selected DuckDB WASM variant.

## Suggested next steps

- Add OR/nested filter groups and explicit text/date filter presets.
- Add opt-in OPFS saved sessions and saved views if the product later gains a paid tier.
- Add encoding transcoding in a dedicated worker and broader malformed-CSV diagnostics.
- Benchmark the same 1 GB fixture on the factory’s reference mid-range Windows laptop and Safari hardware.
