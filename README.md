# Glassline

Glassline opens, filters, groups, pivots, queries, and exports CSV files that are too large for a spreadsheet. DuckDB-WASM does the work inside the browser: files and results never go to a server.

Live product: <https://big-csv-browser-viewer.sociobot.in>

## Who it is for

Analysts, operations teams, and finance staff who receive multi-million-row exports and need an answer without installing Python, learning a database CLI, or uploading sensitive data to a SaaS tool.

## What works

- Opens CSV, TSV, text, and the first worksheet of XLSX files.
- Reads CSV directly through the browser file handle, avoiding a duplicate in-memory copy.
- Detects delimiters, headers, and data types, with recovery controls for inconsistent files.
- Shows a 100-row virtual window with sorting and direct row-number jumping.
- Builds multiple AND filters with typed numeric and date comparisons.
- Profiles any column with filled, distinct, min, and max statistics.
- Creates group summaries and pivots (up to 20 pivot values and 500 result rows).
- Runs read-only DuckDB SQL against the `data` view, capped at 1,000 displayed rows.
- Exports the entire filtered view as CSV or compressed Parquet.
- Works at 390 px, supports keyboard navigation, and caches the app shell for repeat/offline use.

Keyboard shortcuts in the workspace: `/` opens filters, `g` focuses the grid, and `e` opens export.

## Privacy

There is no upload endpoint, account, analytics, advertising, or third-party runtime code. The service worker caches application assets only, never opened files or results. The active workspace disappears when the tab is closed or refreshed. See the in-product [privacy page](https://big-csv-browser-viewer.sociobot.in/privacy/).

## Develop

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

## Verify

```sh
npm test          # SQL-builder unit tests
npm run build     # reproducible static build in ./dist
npx playwright install chromium
npm run test:e2e  # desktop + 390 px, CSV + XLSX + axe accessibility
```

To reproduce the large-file benchmark, run the production preview and the benchmark in separate terminals:

```sh
npm run preview -- --port 4173
GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs
```

`GLASSLINE_BENCH_ROWS` controls the generated row count. With the defaults plus 150 padding characters, the fixture is approximately 1 GB.

## Build and deploy

```sh
npm ci
npm run build
```

Deploy the contents of `dist/` as an Azure Static Web App. `public/staticwebapp.config.json` supplies immutable asset caching and security headers, including the narrow CSP3 `wasm-unsafe-eval` allowance DuckDB-WASM needs to compile locally (not `unsafe-eval`). DuckDB and the XLSX reader are bundled locally; the 34 MB query engine is fetched only after a user chooses a file. The initial application JavaScript is about 31 KB uncompressed.

## Practical limits

Browser and device memory still set the ceiling. CSV/TSV is the right format for very large files; XLSX parsing materializes the first worksheet in memory and is best for smaller workbooks. Glassline expects UTF-8 delimited text. Safari typically has a lower memory ceiling than Chromium browsers. Pivots intentionally cap distinct columns so an accidental high-cardinality field cannot freeze the interface.

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
