# Glassline demo

- URL: `https://big-csv-browser-viewer.sociobot.in/?demo=1` (`/demo` is an equivalent direct route).
- Sample: `public/sample-orders.csv`, a deterministic 40-row operations order export covering four regions, channels, statuses, categories, and owners.
- Entry: choose **Try it with sample data** on the first screen. The full CSV viewer opens immediately after local engine startup.
- Isolation: demo state exists only in JavaScript memory. Glassline does not read from or write to localStorage, sessionStorage, IndexedDB, or OPFS.
- Reset: **Reset demo** closes the in-memory engine, creates a fresh engine, and reloads the original 40 rows.
- Exit: **Start for real** navigates to `/`; navigation discards the demo engine and opens the empty real-file screen.
- Footer: the standard Privacy, Terms, Param Factory, and version footer remains after the full-height viewer.
- Offline: the service worker caches the public sample and same-origin engine assets. After the first completed visit, `?demo=1` reloads with the sample while offline.
