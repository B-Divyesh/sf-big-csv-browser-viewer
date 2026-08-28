# Copy audit

Audited August 28, 2026. Counts treat hyphenated terms, paths, and keyboard keys as one word. No line exceeds 22 words. No banned marketing terms remain.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Glassline | 1 | Pass |
| Ready locally | 2 | Pass |
| Demo | 1 | Pass |
| Privacy | 1 | Pass |
| Runs on this device | 4 | Pass |
| Filter large CSV files in your browser. | 7 | Pass |
| For analysts handling exports too large for Excel, find and export the rows you need. | 15 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a 40-row order file in the real workspace. | 9 | Pass; quantitative claim tested |
| Open your own file | 4 | Pass |
| Drop or choose CSV, TSV, TXT, or XLSX | 8 | Pass |
| Open your CSV | 3 | Pass |
| File stays in this tab | 5 | Pass; privacy claim tested |
| Works offline after the first visit | 6 | Pass; offline claim tested |
| Free to use | 3 | Pass; demo access claim tested |
| Filter · Pivot · Query | 3 | Pass |
| Processed on this device | 4 | Pass; privacy claim tested |
| Open your CSV | 3 | Pass |
| Choose the file you received. | 5 | Pass |
| Filter and summarize rows | 4 | Pass |
| Sort, group, pivot, or query. | 5 | Pass |
| Export selected rows | 3 | Pass |
| Download CSV or Parquet. | 4 | Pass |
| Filter large CSV files in your browser. | 7 | Pass |
| Built by Param Factory | 4 | Pass |
| Original AI-generated artwork | 3 | Pass |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Glassline | 1 | Pass |
| Filter, summarize, query, and export large CSV files in your browser. | 11 | Pass |
| Glassline is for analysts working beyond spreadsheet limits. | 8 | Pass |
| Who it is for | 4 | Pass |
| For analysts who receive spreadsheet exports too large for Excel and need a quick answer. | 14 | Pass |
| What it does | 3 | Pass |
| Opens CSV, TSV, TXT, and the first worksheet of XLSX files. | 11 | Pass; format claim tested |
| Filters, sorts, groups, pivots, profiles columns, and runs read-only SQL. | 10 | Pass; workflow claim tested |
| Exports every filtered row as CSV or Parquet. | 8 | Pass; export claims tested |
| Opens 40 sample orders without an account and resets them on demand. | 12 | Pass; demo claim tested |
| Keeps workspace actions usable at 390 px and supports `/`, `g`, and `e` keyboard shortcuts. | 14 | Pass; mobile claim tested |
| The sample route uses the real workspace. | 7 | Pass |
| See `.factory/demo.md` for its data and isolation model. | 8 | Pass |
| Privacy and offline use | 4 | Pass |
| File processing happens in browser memory. | 6 | Pass; privacy claim tested |
| The tested demo flow makes same-origin runtime requests only. | 9 | Pass; privacy claim tested |
| The offline cache stores app files and the public sample. | 10 | Pass; offline claim tested |
| It does not store files you choose or their results. | 10 | Pass; privacy claim tested |
| After one completed visit, the sample workspace can reopen offline. | 10 | Pass; offline claim tested |
| Refreshing the real workspace clears its active file. | 8 | Pass; format-flow test covers reset |
| See the privacy page. | 4 | Pass |
| Develop | 1 | Pass |
| Use Node.js 20 or newer. | 6 | Pass |
| Verify | 1 | Pass |
| Each reliance claim and its exact command is recorded in `.factory/claims.json`. | 11 | Pass |
| The optional large-file benchmark generates its fixture outside the repository. | 10 | Pass |
| Build and deploy | 3 | Pass |
| Run `npm ci && npm test && npm run build`. | 9 | Pass |
| Deploy the contents of `dist/` as an Azure Static Web App. | 11 | Pass |
| The static-site configuration applies security headers, caches versioned assets, routes `/demo`, and serves the designed 404 page. | 17 | Pass |
| Practical limits | 2 | Pass |
| Browser memory sets the file-size ceiling. | 6 | Pass |
| Very large files may fail. | 5 | Pass |
| Glassline expects UTF-8 text. | 4 | Pass |
| Use the import recovery controls for inconsistent delimiters or column types. | 11 | Pass |
| License | 1 | Pass |

## Terminology

| Concept | Word used |
| --- | --- |
| A visitor’s imported dataset | file |
| The shipped try-out | demo |
| The shipped dataset | sample file |
| The filtered/sorted working state | view |
| A downloaded result | export |
| The main data interface | workspace |
