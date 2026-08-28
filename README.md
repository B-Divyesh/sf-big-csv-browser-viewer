# Glassline

Filter, summarize, query, and export large CSV files in your browser. Glassline is for analysts working beyond spreadsheet limits.

Live product: <https://big-csv-browser-viewer.sociobot.in>

Demo: <https://big-csv-browser-viewer.sociobot.in/?demo=1>

## Who it is for

For analysts who receive spreadsheet exports too large for Excel and need a quick answer.

## What it does

- Opens CSV, TSV, TXT, and the first worksheet of XLSX files.
- Filters, sorts, groups, pivots, profiles columns, and runs read-only SQL.
- Exports every filtered row as CSV or Parquet.
- Opens 40 sample orders without an account and resets them on demand.
- Keeps workspace actions usable at 390 px and supports `/`, `g`, and `e` keyboard shortcuts.

The sample route uses the real workspace. See [.factory/demo.md](.factory/demo.md) for its data and isolation model.

## Privacy and offline use

File processing happens in browser memory. The tested demo flow makes same-origin runtime requests only.

The offline cache stores app files and the public sample. It does not store files you choose or their results.

After one completed visit, the sample workspace can reopen offline. Refreshing the real workspace clears its active file.

See the [privacy page](https://big-csv-browser-viewer.sociobot.in/privacy/).

## Develop

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

## Verify

```sh
npm test
npm run build
npm run test:e2e
npm run test:claims
```

Each reliance claim and its exact command is recorded in [.factory/claims.json](.factory/claims.json).

The optional large-file benchmark generates its fixture outside the repository:

```sh
npm run preview -- --port 4173
GLASSLINE_BENCH_PAD=150 node scripts/benchmark-large.mjs
```

## Build and deploy

Run `npm ci && npm test && npm run build`. Deploy the contents of `dist/` as an Azure Static Web App.

The static-site configuration applies security headers, caches versioned assets, routes `/demo`, and serves the designed 404 page.

## Practical limits

Browser memory sets the file-size ceiling. Very large files may fail.

Glassline expects UTF-8 text. Use the import recovery controls for inconsistent delimiters or column types.

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
