# Copy audit

Audited September 5, 2026 after repair 8. Counts treat hyphenated terms, paths, URLs, and keyboard keys as one word. No sentence exceeds 22 words. No banned marketing terms, mood headings, or metaphorical labels remain.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Glassline | 1 | Pass |
| Ready locally | 2 | Pass |
| Demo | 1 | Pass |
| Privacy | 1 | Pass |
| Runs on this device | 4 | Pass; local-processing |
| Open 5-million-row CSV files in your browser. | 6 | Pass; large-file |
| For analysts with files a spreadsheet app cannot open, find and export the rows you need. | 16 | Pass; audience and large-file context |
| Try it with sample data | 5 | Pass |
| Opens 40 sample orders in the full CSV viewer. | 9 | Pass; demo-sandbox |
| Open your own file | 4 | Pass |
| Drop or choose CSV, TSV, TXT, or XLSX | 8 | Pass; supported-file-formats |
| Open a data file | 4 | Pass |
| File stays in this tab | 5 | Pass; real-file-storage |
| Sample works offline after the first visit | 7 | Pass; offline-reload |
| Free to use | 3 | Pass; demo-sandbox |
| Filter · Pivot · Query | 3 | Pass; core-workflow |
| Processed on this device | 4 | Pass; local-processing |
| Open a data file | 4 | Pass; supported-file-formats |
| Choose the file you received. | 5 | Pass |
| Filter and summarize rows | 4 | Pass; core-workflow |
| Sort, group, pivot, or query. | 5 | Pass; core-workflow |
| Export selected rows | 3 | Pass; csv-export and parquet-export |
| Download CSV or Parquet. | 4 | Pass; export claims |
| Privacy and limits | 3 | Pass; section names its content |
| Read the privacy details | 4 | Pass; destination-naming link |
| Your file stays in this tab | 6 | Pass; real-file-storage |
| Closing or refreshing clears the active workspace. | 7 | Pass; real-file-storage |
| Cloud save and collaboration are not available. | 7 | Pass; real-file-storage |
| The cache holds the public sample | 6 | Pass; offline-reload |
| It stores app files and the sample. | 7 | Pass; offline-reload |
| It does not store a file you choose or an export. | 11 | Pass; real-file-storage |
| Browser memory limits file size | 5 | Pass; practical limit |
| Very large files may fail. | 5 | Pass; practical limit |
| Open 5-million-row CSV files in your browser. | 6 | Pass; large-file |
| Built by Param Factory | 4 | Pass |
| v1.4 · Original AI-generated artwork | 4 | Pass; version and provenance |

## Workspace

| Copy | Words | Result |
| --- | ---: | --- |
| Showing up to 100 rows | 5 | Pass; grid-window |
| Calculated across the current filtered view. | 7 | Pass; filtered-profile |
| Results are capped at 500 rows and 20 pivot columns. | 10 | Pass; analysis-limits |
| Display is capped at 1,000 rows. | 7 | Pass; sql-display-limit |
| Typed column data | 3 | Pass; parquet-export; no size comparison |

## Dialogs

The dialog name is its single literal task heading. No secondary mood label is present.

| Copy | Words | Result |
| --- | ---: | --- |
| Filter rows | 2 | Pass; direct task |
| Add another condition | 3 | Pass; result-naming action |
| Apply filters | 2 | Pass; result-naming action |
| Group and pivot | 3 | Pass; direct task |
| Group | 1 | Pass; tab name |
| Pivot | 1 | Pass; tab name |
| Group rows by | 3 | Pass; field label |
| Calculate | 1 | Pass; field label |
| Using column | 2 | Pass; field label |
| Run summary | 2 | Pass; result-naming action |
| Choose fields, then run a summary. | 6 | Pass; next step |
| Results are capped at 500 rows and 20 pivot columns. | 10 | Pass; analysis-limits |
| Query with SQL | 3 | Pass; direct task |
| DuckDB SQL · table name is data | 6 | Pass; field label |
| Read-only statements only. | 3 | Pass; input limit |
| Display is capped at 1,000 rows. | 7 | Pass; sql-display-limit |
| Run query | 2 | Pass; result-naming action |
| Export this view | 3 | Pass; direct task |
| All rows in the current view will be exported. | 9 | Pass; export scope |
| Best for spreadsheets | 3 | Pass; format help |
| Typed column data | 3 | Pass; parquet-export; no comparative size claim |
| Created entirely on this device | 5 | Pass; local-processing |
| Export file | 2 | Pass; result-naming action |
| Check the import settings | 4 | Pass; direct recovery task |
| Glassline expects UTF-8 text. | 4 | Pass; import-recovery |
| XLSX reads the first worksheet. | 5 | Pass; supported-file-formats |
| Choose another file | 3 | Pass; recovery action |
| Try again | 2 | Pass; recovery action |
| Local engine could not start | 5 | Pass; specific error heading |
| Glassline could not start its on-device data engine. | 8 | Pass; specific error |
| Nothing was uploaded. | 3 | Pass; local-processing |
| Check that this browser allows WebAssembly, then try again. | 9 | Pass; recovery step |
| Retry engine | 2 | Pass; recovery action |

## Not-found page

| Copy | Words | Result |
| --- | ---: | --- |
| Page not found | 3 | Pass; literal status |
| The address does not match a Glassline page. | 8 | Pass; specific explanation |
| Return to the CSV viewer | 5 | Pass; destination-naming action |
| Try the sample data | 4 | Pass; result-naming action |
| Open 5-million-row CSV files in your browser. | 6 | Pass; large-file |
| Built by Param Factory | 4 | Pass |
| v1.4 | 1 | Pass; version |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Open, filter, summarize, query, and export 5-million-row CSV files in your browser. | 10 | Pass; large-file and workflow claims |
| Glassline is for analysts with files a spreadsheet app cannot open. | 11 | Pass |
| For analysts who receive files a spreadsheet app cannot open and need a quick answer. | 15 | Pass |
| Opens CSV, TSV, TXT, and the first worksheet of XLSX files. | 11 | Pass; supported-file-formats |
| Filters, sorts, groups, pivots, profiles columns, and runs read-only SQL. | 10 | Pass; core-workflow |
| Exports every filtered row as CSV or Parquet. | 8 | Pass; export claims |
| Opens 40 sample orders without an account and resets them on demand. | 12 | Pass; demo-sandbox |
| Keeps every visible action at least 44 by 44 pixels at 390 px. | 13 | Pass; mobile-controls |
| The workspace supports `/`, `g`, and `e` keyboard shortcuts. | 9 | Pass; mobile-controls |
| The sample route uses the full CSV viewer. | 8 | Pass |
| Files, filters, queries, and exports run in the browser. | 9 | Pass; local-processing |
| During the tested demo, every network request stays on this site. | 10 | Pass; local-processing |
| The offline cache stores app files and the public sample. | 10 | Pass; offline-reload |
| After one completed visit, the sample workspace can reopen offline. | 10 | Pass; offline-reload |
| Glassline does not store a file you choose or its export. | 11 | Pass; real-file-storage |
| Refreshing or closing the tab clears the active workspace. | 9 | Pass; real-file-storage |
| Each product promise and its test command appears in `.factory/claims.json`. | 10 | Pass |
| The large-file claim creates its test file outside the repository. | 10 | Pass |
| It opens and counts 5,000,000 rows in an about 1 GB CSV within 30 seconds in the Chromium benchmark environment. | 19 | Pass; large-file |
| Run `npm ci && npm test && npm run build`. | 8 | Pass |
| Deploy the contents of `dist/` as an Azure Static Web App. | 11 | Pass |
| Browser memory sets the file-size ceiling. | 6 | Pass; limitation |
| Very large files may fail. | 5 | Pass; limitation |
| Use UTF-8 CSV files. | 4 | Pass; import-recovery |
| If the separator is wrong, choose the file’s separator and retry. | 11 | Pass; import-recovery |

## Terminology

| Concept | Word used |
| --- | --- |
| A visitor’s imported dataset | file |
| The shipped try-out | demo |
| The shipped dataset | sample file |
| The filtered or sorted working state | view |
| A downloaded result | export |
| The main data interface | CSV viewer |
