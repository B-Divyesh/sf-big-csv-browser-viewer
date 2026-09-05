# Glassline

Open, filter, summarize, query, and export 5-million-row CSV files in your browser. Glassline is for analysts with files a spreadsheet app cannot open.

Live product: <https://big-csv-browser-viewer.sociobot.in>

Demo: <https://big-csv-browser-viewer.sociobot.in/?demo=1>

## Who it is for

For analysts who receive files a spreadsheet app cannot open and need a quick answer.

## What it does

- Opens CSV, TSV, TXT, and the first worksheet of XLSX files.
- Filters, sorts, groups, pivots, profiles columns, and runs read-only SQL.
- Exports every filtered row as CSV or Parquet.
- Opens 40 sample orders without an account and resets them on demand.
- Keeps every visible action at least 44 by 44 pixels at 390 px. The workspace supports `/`, `g`, and `e` keyboard shortcuts.

The sample route uses the full CSV viewer. See [.factory/demo.md](.factory/demo.md) for its data and isolation model.

## Privacy and offline use

Files, filters, queries, and exports run in the browser. During the tested demo, every network request stays on this site.

The offline cache stores app files and the public sample. After one completed visit, the sample workspace can reopen offline.

Glassline does not store a file you choose or its export. Refreshing or closing the tab clears the active workspace.

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

Each product promise and its test command appears in [.factory/claims.json](.factory/claims.json).

The large-file claim creates its test file outside the repository:

```sh
npm run test:large-file
```

It opens and counts 5,000,000 rows in an about 1 GB CSV within 30 seconds in the Chromium benchmark environment.

## Build and deploy

Run `npm ci && npm test && npm run build`. Deploy the contents of `dist/` as an Azure Static Web App.

## Practical limits

Browser memory sets the file-size ceiling. Very large files may fail.

Use UTF-8 CSV files. If the separator is wrong, choose the file’s separator and retry.

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
