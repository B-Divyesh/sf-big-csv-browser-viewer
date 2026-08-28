import './styles.css';
import {
  buildDataQuery,
  buildGroupQuery,
  buildPivotQuery,
  isReadOnlySql,
  quoteIdentifier,
  whereClause,
  type ColumnInfo,
  type FilterRule,
  type Operator,
  type SortRule,
} from './query';
import type { CsvOptions, LocalDataEngine } from './engine';

const icon = (name: 'mark' | 'shield' | 'upload' | 'filter' | 'pivot' | 'sql' | 'export' | 'search' | 'close' | 'columns') => {
  const paths = {
    mark: '<path d="M4 7h16M4 12h16M4 17h10M9 4v16M17 4v10"/>',
    shield: '<path d="M12 3 4.8 6v5.5c0 4.4 3 7.8 7.2 9.5 4.2-1.7 7.2-5.1 7.2-9.5V6L12 3Z"/><path d="m8.8 12 2 2 4.5-4.5"/>',
    upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 14v5h14v-5"/>',
    filter: '<path d="M4 5h16l-6.3 7.1V19l-3.4 1v-7.9L4 5Z"/>',
    pivot: '<path d="M5 4v16h15M8 15l4-4 3 3 5-6"/><path d="M16 8h4v4"/>',
    sql: '<path d="m4 7 4 5-4 5m7 0h9"/>',
    export: '<path d="M12 4v12m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    columns: '<path d="M4 5h16v14H4zM10 5v14M16 5v14"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const routeUrl = new URL(window.location.href);
const demoMode = routeUrl.searchParams.get('demo') === '1' || routeUrl.pathname === '/demo' || routeUrl.pathname === '/demo/';
app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="/" aria-label="Glassline home">${icon('mark')}<span>Glassline</span></a>
    <div class="header-status"><span class="pulse" aria-hidden="true"></span><span id="network-label">Ready locally</span></div>
    <nav aria-label="Utility">
      <a href="/?demo=1">Demo</a>
      <a href="/privacy/">Privacy</a>
      <button class="ghost small only-workspace" id="new-file" hidden>Open another file</button>
    </nav>
  </header>
  <aside class="demo-banner" id="demo-banner" aria-label="Demo mode" hidden>
    <p><strong>Demo</strong> — sample data, nothing is saved</p>
    <div><button class="ghost" id="reset-demo">Reset demo</button><a class="button-link" href="/">Start for real</a></div>
  </aside>
  <p class="sr-only" id="route-status" aria-live="polite"></p>
  <main id="main">
    <section class="landing" id="landing" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> Runs on this device</p>
        <h1 id="hero-title">Filter large CSV files<br><em>in your browser.</em></h1>
        <p class="lede">For analysts handling exports too large for Excel, find and export the rows you need.</p>
        <div class="hero-actions">
          <a class="demo-action" href="/?demo=1">Try it with sample data</a>
          <span>Opens a 40-row order file in the real workspace.</span>
        </div>
        <label class="drop-zone" id="drop-zone" tabindex="0">
          <input id="file-input" type="file" accept=".csv,.tsv,.txt,.xlsx,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
          <span class="drop-icon">${icon('upload')}</span>
          <span><strong>Open your own file</strong><small>Drop or choose CSV, TSV, TXT, or XLSX</small></span>
          <span class="choose-file">Open your CSV</span>
        </label>
        <div class="trust-row" aria-label="Product qualities">
          <span>${icon('shield')} File stays in this tab</span>
          <span>Works offline after the first visit</span>
          <span>Free to use</span>
        </div>
      </div>
      <figure class="hero-visual">
        <picture>
          <source srcset="/assets/data-landscape.avif" type="image/avif" />
          <img src="/assets/data-landscape.webp" width="768" height="512" alt="Abstract glass data slab unfolding into a vast field of ordered rows" fetchpriority="high" decoding="async" />
        </picture>
        <figcaption><span>Filter · Pivot · Query</span><span>Processed on this device</span></figcaption>
      </figure>
      <div class="how-strip">
        <p><span>01</span><strong>Open your CSV</strong><small>Choose the file you received.</small></p>
        <p><span>02</span><strong>Filter and summarize rows</strong><small>Sort, group, pivot, or query.</small></p>
        <p><span>03</span><strong>Export selected rows</strong><small>Download CSV or Parquet.</small></p>
      </div>
    </section>

    <section class="workspace" id="workspace" hidden aria-labelledby="workspace-title">
      <div class="file-bar">
        <div class="file-identity">
          <span class="file-glyph">CSV</span>
          <div><h2 id="workspace-title" tabindex="-1">Data file</h2><p><span id="file-size"></span><span aria-hidden="true"> · </span><span id="row-count">Counting rows…</span></p></div>
        </div>
        <div class="tool-bar" aria-label="Data tools">
          <button id="open-filter" aria-label="Filter rows">${icon('filter')}<span>Filter</span><kbd>/</kbd></button>
          <button id="open-analysis" aria-label="Group and pivot">${icon('pivot')}<span>Group & pivot</span></button>
          <button id="open-sql" aria-label="SQL query">${icon('sql')}<span>SQL</span></button>
          <button class="primary" id="open-export" aria-label="Export view">${icon('export')}<span>Export</span><kbd>E</kbd></button>
        </div>
      </div>
      <div class="query-strip" id="query-strip">
        <span class="query-label">VIEW</span>
        <div id="filter-chips" class="filter-chips"><span class="muted">All rows · Click a column heading to sort</span></div>
        <button class="clear-view" id="clear-view" hidden>Clear view</button>
      </div>
      <div class="data-layout">
        <aside class="columns-panel" id="columns-panel" aria-label="Columns">
          <div class="panel-heading"><strong>Columns</strong><span id="column-count">0</span></div>
          <label class="search-field">${icon('search')}<span class="sr-only">Search columns</span><input id="column-search" type="search" placeholder="Find a column" /></label>
          <div id="column-list" class="column-list"></div>
        </aside>
        <section class="grid-panel" aria-label="Data table">
          <div class="grid-scroll" id="grid-scroll" tabindex="0" role="region" aria-label="Scrollable data grid">
            <div class="grid-content" id="grid-content" role="grid" aria-rowcount="-1"></div>
          </div>
          <footer class="grid-footer">
            <p id="grid-status" role="status" aria-live="polite">Preparing data…</p>
            <label>Jump to row <input id="jump-row" type="number" min="1" value="1" inputmode="numeric" /></label>
            <span>Showing up to 100 rows</span>
          </footer>
        </section>
        <aside class="stats-panel" id="stats-panel" hidden aria-labelledby="stats-title">
          <button class="icon-button close-stats" id="close-stats" aria-label="Close column statistics">${icon('close')}</button>
          <p class="eyebrow">Column profile</p>
          <h3 id="stats-title">Column</h3>
          <p class="type-badge" id="stats-type"></p>
          <dl id="stats-values" class="stats-values"></dl>
          <p class="stats-note">Calculated across the current filtered view.</p>
        </aside>
      </div>
    </section>
  </main>

  <footer class="site-footer" id="site-footer">
    <p>Filter large CSV files in your browser.</p>
    <p><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://sociobot.in">Built by Param Factory</a><span>v1.1 · Original AI-generated artwork</span></p>
  </footer>

  <div class="loading-layer" id="loading-layer" hidden role="status" aria-live="assertive">
    <div class="loader-mark">${icon('mark')}</div><strong id="loading-title">Starting local engine</strong><p id="loading-detail">Loading DuckDB for the first time…</p>
    <div class="progress-track"><span id="progress-fill"></span></div><button class="ghost" id="cancel-load">Cancel</button>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

  <dialog id="filter-dialog" aria-labelledby="filter-title">
    <form method="dialog" class="dialog-shell" id="filter-form">
      <div class="dialog-header"><div><p class="eyebrow">Shape the view</p><h2 id="filter-title">Filter rows</h2></div><button class="icon-button" value="cancel" aria-label="Close filters">${icon('close')}</button></div>
      <div id="filter-list" class="filter-list"></div>
      <button type="button" class="ghost add-rule" id="add-filter">+ Add another condition</button>
      <div class="dialog-actions"><button value="cancel" class="ghost">Cancel</button><button value="apply" class="primary" id="apply-filter">Apply filters</button></div>
    </form>
  </dialog>

  <dialog id="analysis-dialog" aria-labelledby="analysis-title">
    <form method="dialog" class="dialog-shell wide" id="analysis-form">
      <div class="dialog-header"><div><p class="eyebrow">Summarize locally</p><h2 id="analysis-title">Group & pivot</h2></div><button class="icon-button" value="cancel" aria-label="Close analysis">${icon('close')}</button></div>
      <div class="segmented" role="tablist"><button type="button" role="tab" aria-selected="true" id="group-tab">Group</button><button type="button" role="tab" aria-selected="false" id="pivot-tab">Pivot</button></div>
      <div class="analysis-fields" id="analysis-fields"></div>
      <button type="button" class="primary" id="run-analysis">Run summary</button>
      <div class="result-table" id="analysis-result"><p class="empty-inline">Choose fields, then run a summary. Results are capped at 500 rows and 20 pivot columns.</p></div>
    </form>
  </dialog>

  <dialog id="sql-dialog" aria-labelledby="sql-title">
    <form method="dialog" class="dialog-shell wide" id="sql-form">
      <div class="dialog-header"><div><p class="eyebrow blue">Power view</p><h2 id="sql-title">Query with SQL</h2></div><button class="icon-button" value="cancel" aria-label="Close SQL">${icon('close')}</button></div>
      <label class="sql-label" for="sql-editor">DuckDB SQL · table name is <code>data</code></label>
      <textarea id="sql-editor" spellcheck="false">SELECT * FROM data LIMIT 100</textarea>
      <p class="form-help">Read-only statements only. Display is capped at 1,000 rows.</p>
      <div class="dialog-actions"><span id="sql-status" role="status"></span><button type="button" class="primary blue-button" id="run-sql">Run query</button></div>
      <div class="result-table" id="sql-result"></div>
    </form>
  </dialog>

  <dialog id="export-dialog" aria-labelledby="export-title">
    <form method="dialog" class="dialog-shell export-shell">
      <div class="dialog-header"><div><p class="eyebrow">Take the answer</p><h2 id="export-title">Export this view</h2></div><button class="icon-button" value="cancel" aria-label="Close export">${icon('close')}</button></div>
      <p id="export-scope">All rows in the current view will be exported.</p>
      <fieldset class="format-options"><legend>Format</legend>
        <label><input type="radio" name="format" value="csv" checked /><span><strong>CSV</strong><small>Best for spreadsheets</small></span></label>
        <label><input type="radio" name="format" value="parquet" /><span><strong>Parquet</strong><small>Smaller, typed data</small></span></label>
      </fieldset>
      <p class="local-note">${icon('shield')} Created entirely on this device</p>
      <div class="dialog-actions"><button value="cancel" class="ghost">Cancel</button><button type="button" class="primary" id="export-now">Export file</button></div>
    </form>
  </dialog>

  <dialog id="error-dialog" aria-labelledby="error-title">
    <form method="dialog" class="dialog-shell">
      <div class="dialog-header"><div><p class="eyebrow error">Couldn’t read the file</p><h2 id="error-title">Check the import settings</h2></div><button class="icon-button" value="cancel" aria-label="Close error">${icon('close')}</button></div>
      <p id="error-message"></p>
      <div class="import-options">
        <label>Delimiter<select id="delimiter"><option value="auto">Detect automatically</option><option value=",">Comma</option><option value="\t">Tab</option><option value=";">Semicolon</option><option value="|">Pipe</option></select></label>
        <label class="check"><input type="checkbox" id="has-header" checked /> First row contains headings</label>
        <label class="check"><input type="checkbox" id="all-text" /> Import every column as text</label>
      </div>
      <p class="form-help">Glassline expects UTF-8 text. XLSX reads the first worksheet.</p>
      <div class="dialog-actions"><button type="button" class="ghost" id="choose-another">Choose another file</button><button type="button" class="primary" id="retry-import">Try again</button></div>
    </form>
  </dialog>
`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const landing = $('#landing');
const workspace = $('#workspace');
const fileInput = $<HTMLInputElement>('#file-input');
const dropZone = $('#drop-zone');
const loadingLayer = $('#loading-layer');
const loadingTitle = $('#loading-title');
const loadingDetail = $('#loading-detail');
const progressFill = $('#progress-fill');
const gridScroll = $('#grid-scroll');
const gridContent = $('#grid-content');
const filterDialog = $<HTMLDialogElement>('#filter-dialog');
const analysisDialog = $<HTMLDialogElement>('#analysis-dialog');
const sqlDialog = $<HTMLDialogElement>('#sql-dialog');
const exportDialog = $<HTMLDialogElement>('#export-dialog');
const errorDialog = $<HTMLDialogElement>('#error-dialog');

let engine: LocalDataEngine | null = null;
let currentFile: File | null = null;
let columns: ColumnInfo[] = [];
let filters: FilterRule[] = [];
let sort: SortRule | null = null;
let rowCount: number | null = null;
let currentOffset = 0;
let querySequence = 0;
let ruleSequence = 1;
let analysisMode: 'group' | 'pivot' = 'group';
let importOptions: CsvOptions = { delimiter: 'auto', header: true, allVarchar: false };
let loadSequence = 0;

function replaceHeading(id: string, level: 1 | 2): HTMLElement {
  const current = $<HTMLElement>(`#${id}`);
  if (current.tagName === `H${level}`) return current;
  const replacement = document.createElement(`h${level}`);
  for (const attribute of current.attributes) replacement.setAttribute(attribute.name, attribute.value);
  replacement.innerHTML = current.innerHTML;
  current.replaceWith(replacement);
  return replacement;
}

function setRouteMetadata(isDemo: boolean): void {
  const title = isDemo ? 'Demo — Glassline' : 'Glassline — Filter large CSV files in your browser';
  const canonical = isDemo ? 'https://big-csv-browser-viewer.sociobot.in/demo' : 'https://big-csv-browser-viewer.sociobot.in/';
  document.title = title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = canonical;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = canonical;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = title;
}

function formatNumber(value: number): string { return new Intl.NumberFormat().format(value); }
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = units[0]!;
  for (let i = 1; value >= 1024 && i < units.length; i++) { value /= 1024; unit = units[i]!; }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
}
function displayValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
function showToast(message: string): void {
  const toast = $('#toast'); toast.textContent = message; toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 3200);
}
function showLoading(title: string, detail: string, percent = 8): void {
  loadingTitle.textContent = title; loadingDetail.textContent = detail; progressFill.style.width = `${percent}%`; loadingLayer.hidden = false;
}
function updateLoading(title: string, detail: string, percent: number): void {
  loadingTitle.textContent = title; loadingDetail.textContent = detail; progressFill.style.width = `${percent}%`;
}
function hideLoading(): void { loadingLayer.hidden = true; }

async function getEngine(): Promise<LocalDataEngine> {
  if (!engine) {
    const module = await import('./engine');
    engine = new module.LocalDataEngine();
  }
  return engine;
}

async function openFile(file: File): Promise<void> {
  if (!/\.(csv|tsv|txt|xlsx)$/i.test(file.name)) {
    showToast('Choose a CSV, TSV, TXT, or XLSX file.'); return;
  }
  currentFile = file;
  const operation = ++loadSequence;
  let localEngine: LocalDataEngine | null = null;
  showLoading('Starting the local engine', 'Preparing the private query engine…', 10);
  try {
    localEngine = await getEngine();
    updateLoading('Reading file structure', 'Detecting columns and data types on this device…', 58);
    const result = await localEngine.open(file, importOptions, (percent) => { progressFill.style.width = `${Math.max(10, percent * .5)}%`; });
    if (operation !== loadSequence) { await localEngine.close(); return; }
    columns = result.columns; filters = []; sort = null; rowCount = null; currentOffset = 0;
    updateLoading('Building the first view', 'Preparing a virtual window into your rows…', 86);
    enterWorkspace(file);
    renderColumns();
    renderGrid(result.preview, 0);
    hideLoading();
    void refreshCount();
  } catch (error) {
    if (operation !== loadSequence) return;
    hideLoading();
    const engineFailure = error instanceof Error && error.name === 'EngineInitializationError';
    $('#error-title').textContent = engineFailure ? 'Local engine could not start' : 'Check the import settings';
    $('#error-message').textContent = engineFailure
      ? 'Glassline could not start its on-device data engine. Nothing was uploaded. Check that this browser allows WebAssembly, then try again.'
      : friendlyError(error);
    document.querySelector<HTMLElement>('#error-dialog .eyebrow')!.textContent = engineFailure ? 'Couldn’t start local processing' : 'Couldn’t read the file';
    document.querySelector<HTMLElement>('#error-dialog .import-options')!.hidden = engineFailure;
    document.querySelector<HTMLElement>('#error-dialog .form-help')!.hidden = engineFailure;
    $('#retry-import').textContent = engineFailure ? 'Retry engine' : 'Try again';
    if (engineFailure && localEngine && engine === localEngine) {
      engine = null;
      await localEngine.close().catch(() => undefined);
    }
    errorDialog.showModal();
  }
}

function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/memory|alloc/i.test(raw)) return 'The browser ran out of memory while reading this file. Close other tabs, try CSV instead of XLSX, or import all columns as text.';
  if (/CSV|column|delimiter|quote|parse|sniff/i.test(raw)) return 'The rows do not appear to use one consistent CSV structure. Choose the delimiter below, or save the file as UTF-8 CSV and try again.';
  return `The local engine reported: ${raw.slice(0, 300)}`;
}

function enterWorkspace(file: File): void {
  landing.hidden = true; $('#site-footer').hidden = true; workspace.hidden = false;
  document.querySelectorAll<HTMLElement>('.only-workspace').forEach((item) => { item.hidden = demoMode; });
  replaceHeading('hero-title', 2);
  const workspaceTitle = replaceHeading('workspace-title', 1);
  workspaceTitle.textContent = file.name;
  $('#file-size').textContent = formatBytes(file.size);
  $('#column-count').textContent = String(columns.length);
  $('#route-status').textContent = `${file.name} workspace opened`;
  workspaceTitle.focus();
  updateNetwork();
}

function renderColumns(search = ''): void {
  const list = $('#column-list'); list.replaceChildren();
  const needle = search.toLowerCase();
  columns.filter((column) => column.name.toLowerCase().includes(needle)).forEach((column) => {
    const button = document.createElement('button'); button.className = 'column-item'; button.type = 'button';
    const name = document.createElement('span'); name.textContent = column.name;
    const type = document.createElement('small'); type.textContent = shortType(column.type); type.className = typeClass(column.type);
    button.append(name, type); button.addEventListener('click', () => void showStats(column)); list.append(button);
  });
  if (!list.children.length) { const empty = document.createElement('p'); empty.className = 'empty-inline'; empty.textContent = 'No matching columns.'; list.append(empty); }
}

function shortType(type: string): string {
  if (/INT|DECIMAL|DOUBLE|FLOAT|REAL|NUMERIC/i.test(type)) return '123';
  if (/DATE|TIME/i.test(type)) return 'DATE';
  if (/BOOL/i.test(type)) return 'T/F';
  return 'ABC';
}
function typeClass(type: string): string { return /INT|DECIMAL|DOUBLE|FLOAT|REAL|NUMERIC/i.test(type) ? 'number' : /DATE|TIME/i.test(type) ? 'date' : 'text'; }

function renderGrid(rows: Record<string, unknown>[], offset: number): void {
  gridContent.replaceChildren();
  gridContent.setAttribute('aria-rowcount', rowCount === null ? '-1' : String(rowCount + 1));
  const width = Math.max(gridScroll.clientWidth, columns.length * 180 + 58);
  gridContent.style.width = `${width}px`;
  gridContent.style.setProperty('--column-count', String(columns.length));
  const header = document.createElement('div'); header.className = 'grid-row grid-header'; header.setAttribute('role', 'row');
  const corner = document.createElement('div'); corner.className = 'grid-cell row-number'; corner.setAttribute('role', 'columnheader'); corner.textContent = '#'; header.append(corner);
  columns.forEach((column) => {
    const button = document.createElement('button'); button.className = 'grid-cell header-cell'; button.setAttribute('role', 'columnheader');
    button.textContent = column.name;
    if (sort?.column === column.name) { const indicator = document.createElement('span'); indicator.textContent = sort.direction === 'ASC' ? ' ↑' : ' ↓'; button.append(indicator); }
    button.title = `Sort by ${column.name}`; button.addEventListener('click', () => void toggleSort(column.name)); header.append(button);
  });
  gridContent.append(header);
  const body = document.createElement('div'); body.className = 'grid-body'; body.setAttribute('role', 'rowgroup');
  rows.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div'); rowElement.className = 'grid-row'; rowElement.setAttribute('role', 'row');
    const rowNumber = document.createElement('div'); rowNumber.className = 'grid-cell row-number'; rowNumber.setAttribute('role', 'rowheader'); rowNumber.textContent = formatNumber(offset + rowIndex + 1); rowElement.append(rowNumber);
    columns.forEach((column) => {
      const cell = document.createElement('div'); cell.className = `grid-cell ${typeClass(column.type)}`; cell.setAttribute('role', 'gridcell');
      const value = row[column.name]; cell.textContent = displayValue(value); cell.title = displayValue(value); if (value == null) cell.classList.add('null'); rowElement.append(cell);
    });
    body.append(rowElement);
  });
  gridContent.append(body);
  currentOffset = offset;
  $('#grid-status').textContent = rows.length ? `Rows ${formatNumber(offset + 1)}–${formatNumber(offset + rows.length)}${rowCount !== null ? ` of ${formatNumber(rowCount)}` : ''}` : 'No rows match this view.';
  $<HTMLInputElement>('#jump-row').value = String(offset + 1);
}

async function loadPage(offset: number): Promise<void> {
  if (!engine) return;
  const safeOffset = Math.max(0, rowCount === null ? offset : Math.min(offset, Math.max(0, rowCount - 1)));
  const sequence = ++querySequence;
  $('#grid-status').textContent = 'Reading rows…';
  try {
    const rows = await engine.query(buildDataQuery(filters, columns, sort, 100, safeOffset));
    if (sequence === querySequence) renderGrid(rows, safeOffset);
  } catch (error) { if (sequence === querySequence) showToast(friendlyError(error)); }
}

async function refreshView(): Promise<void> {
  currentOffset = 0; rowCount = null; renderQueryStrip();
  await Promise.all([loadPage(0), refreshCount()]);
}

async function refreshCount(): Promise<void> {
  if (!engine) return;
  $('#row-count').textContent = 'Counting rows…';
  try {
    const total = await engine.count(whereClause(filters, columns)); rowCount = total;
    $('#row-count').textContent = `${formatNumber(total)} ${total === 1 ? 'row' : 'rows'}`;
    gridContent.setAttribute('aria-rowcount', String(total + 1));
    $('#export-scope').textContent = `${formatNumber(total)} ${total === 1 ? 'row' : 'rows'} in the current filtered view will be exported.`;
    $('#grid-status').textContent = total ? `Rows ${formatNumber(currentOffset + 1)}–${formatNumber(Math.min(total, currentOffset + 100))} of ${formatNumber(total)}` : 'No rows match this view.';
  } catch { $('#row-count').textContent = 'Row count unavailable'; }
}

async function toggleSort(column: string): Promise<void> {
  sort = sort?.column !== column ? { column, direction: 'ASC' } : sort.direction === 'ASC' ? { column, direction: 'DESC' } : null;
  await refreshView();
}

function renderQueryStrip(): void {
  const container = $('#filter-chips'); container.replaceChildren();
  if (!filters.length && !sort) { const empty = document.createElement('span'); empty.className = 'muted'; empty.textContent = 'All rows · Click a column heading to sort'; container.append(empty); }
  filters.forEach((filter) => {
    const chip = document.createElement('button'); chip.className = 'filter-chip'; chip.type = 'button';
    chip.textContent = `${filter.column} ${operatorLabel(filter.operator)}${filter.value ? ` “${filter.value}”` : ''} ×`;
    chip.setAttribute('aria-label', `Remove filter ${chip.textContent}`);
    chip.addEventListener('click', () => { filters = filters.filter((item) => item.id !== filter.id); void refreshView(); }); container.append(chip);
  });
  if (sort) { const chip = document.createElement('button'); chip.className = 'filter-chip sort-chip'; chip.textContent = `${sort.column} ${sort.direction === 'ASC' ? 'ascending' : 'descending'} ×`; chip.addEventListener('click', () => { sort = null; void refreshView(); }); container.append(chip); }
  $('#clear-view').hidden = !filters.length && !sort;
}

const operators: Array<[Operator, string]> = [
  ['contains', 'contains'], ['equals', 'equals'], ['notEquals', 'does not equal'], ['gt', 'is greater than'], ['gte', 'is at least'], ['lt', 'is less than'], ['lte', 'is at most'], ['isBlank', 'is blank'], ['isNotBlank', 'is not blank'],
];
function operatorLabel(operator: Operator): string { return operators.find(([value]) => value === operator)?.[1] ?? operator; }

function renderFilterBuilder(): void {
  const list = $('#filter-list'); list.replaceChildren();
  if (!filters.length) filters = [{ id: ruleSequence++, column: columns[0]?.name ?? '', operator: 'contains', value: '' }];
  filters.forEach((rule, index) => {
    const row = document.createElement('div'); row.className = 'filter-rule';
    if (index > 0) { const and = document.createElement('span'); and.className = 'and-label'; and.textContent = 'AND'; row.append(and); }
    const columnSelect = document.createElement('select'); columnSelect.setAttribute('aria-label', `Column for condition ${index + 1}`);
    columns.forEach((column) => columnSelect.add(new Option(column.name, column.name, false, column.name === rule.column)));
    const operatorSelect = document.createElement('select'); operatorSelect.setAttribute('aria-label', `Operator for condition ${index + 1}`);
    operators.forEach(([value, label]) => operatorSelect.add(new Option(label, value, false, value === rule.operator)));
    const input = document.createElement('input'); input.value = rule.value; input.placeholder = 'Value'; input.setAttribute('aria-label', `Value for condition ${index + 1}`);
    input.hidden = rule.operator.startsWith('is');
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'icon-button'; remove.setAttribute('aria-label', `Remove condition ${index + 1}`); remove.innerHTML = icon('close');
    columnSelect.addEventListener('change', () => { rule.column = columnSelect.value; });
    operatorSelect.addEventListener('change', () => { rule.operator = operatorSelect.value as Operator; input.hidden = rule.operator.startsWith('is'); });
    input.addEventListener('input', () => { rule.value = input.value; });
    remove.addEventListener('click', () => { filters = filters.filter((item) => item.id !== rule.id); renderFilterBuilder(); });
    row.append(columnSelect, operatorSelect, input, remove); list.append(row);
  });
}

async function showStats(column: ColumnInfo): Promise<void> {
  const panel = $('#stats-panel'); panel.hidden = false; $('#stats-title').textContent = column.name; $('#stats-type').textContent = column.type; $('#stats-values').innerHTML = '<div class="stat-loading">Calculating profile…</div>';
  try {
    const id = quoteIdentifier(column.name);
    const [stats] = await engine!.query(`SELECT COUNT(*) AS rows, COUNT(${id}) AS filled, APPROX_COUNT_DISTINCT(${id}) AS distinct_values, MIN(${id}) AS minimum, MAX(${id}) AS maximum FROM data${whereClause(filters, columns)}`);
    const values: Array<[string, unknown]> = [['Rows', stats?.rows], ['Filled', stats?.filled], ['Distinct (approx.)', stats?.distinct_values], ['Minimum', stats?.minimum], ['Maximum', stats?.maximum]];
    const dl = $('#stats-values'); dl.replaceChildren(); values.forEach(([label, value]) => { const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = displayValue(value); dl.append(dt, dd); });
  } catch (error) { $('#stats-values').textContent = friendlyError(error); }
}

function columnOptions(selected = ''): string { return columns.map((column) => `<option value="${escapeAttribute(column.name)}" ${column.name === selected ? 'selected' : ''}>${escapeHtml(column.name)}</option>`).join(''); }
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
function escapeAttribute(value: string): string { return escapeHtml(value); }

function renderAnalysisFields(): void {
  const fields = $('#analysis-fields');
  if (analysisMode === 'group') fields.innerHTML = `
    <label>Group rows by<select id="group-column">${columnOptions()}</select></label>
    <label>Calculate<select id="aggregate"><option>COUNT</option><option>SUM</option><option>AVG</option><option>MIN</option><option>MAX</option></select></label>
    <label>Using column<select id="value-column"><option value="">Rows (for count)</option>${columnOptions()}</select></label>`;
  else fields.innerHTML = `
    <label>Rows<select id="pivot-row">${columnOptions()}</select></label>
    <label>Columns<select id="pivot-column">${columnOptions(columns[1]?.name)}</select></label>
    <label>Calculate<select id="aggregate"><option>COUNT</option><option>SUM</option><option>AVG</option><option>MIN</option><option>MAX</option></select></label>
    <label>Using column<select id="value-column"><option value="">Rows (for count)</option>${columnOptions()}</select></label>`;
}

function renderResultTable(container: HTMLElement, rows: Record<string, unknown>[]): void {
  container.replaceChildren();
  if (!rows.length) { const empty = document.createElement('p'); empty.className = 'empty-inline'; empty.textContent = 'The query returned no rows.'; container.append(empty); return; }
  const table = document.createElement('table'); const head = table.createTHead().insertRow(); const keys = Object.keys(rows[0]!);
  keys.forEach((key) => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = key; head.append(th); });
  const body = table.createTBody(); rows.forEach((row) => { const tr = body.insertRow(); keys.forEach((key) => { const td = tr.insertCell(); td.textContent = displayValue(row[key]); }); });
  container.append(table);
}

async function runAnalysis(): Promise<void> {
  const result = $('#analysis-result'); result.textContent = 'Calculating summary…';
  try {
    let sql: string;
    if (analysisMode === 'group') {
      const group = $<HTMLSelectElement>('#group-column').value; const value = $<HTMLSelectElement>('#value-column').value; const aggregate = $<HTMLSelectElement>('#aggregate').value;
      if (aggregate !== 'COUNT' && !value) throw new Error('Choose a value column for this calculation.');
      sql = buildGroupQuery(filters, columns, group, value, aggregate);
    } else {
      const row = $<HTMLSelectElement>('#pivot-row').value; const pivot = $<HTMLSelectElement>('#pivot-column').value; const value = $<HTMLSelectElement>('#value-column').value; const aggregate = $<HTMLSelectElement>('#aggregate').value;
      if (row === pivot) throw new Error('Choose different row and column fields.');
      if (aggregate !== 'COUNT' && !value) throw new Error('Choose a value column for this calculation.');
      const keys = await engine!.query(`SELECT DISTINCT ${quoteIdentifier(pivot)} AS pivot_key FROM data${whereClause(filters, columns)} LIMIT 20`);
      sql = buildPivotQuery(filters, columns, row, pivot, value, aggregate, keys.map((item) => item.pivot_key));
    }
    renderResultTable(result, await engine!.query(sql));
  } catch (error) { result.textContent = friendlyError(error); }
}

async function runSql(): Promise<void> {
  const editor = $<HTMLTextAreaElement>('#sql-editor'); const status = $('#sql-status'); const result = $('#sql-result'); const sql = editor.value.trim().replace(/;\s*$/, '');
  if (!isReadOnlySql(sql)) { status.textContent = 'Use one read-only SELECT, WITH, DESCRIBE, EXPLAIN, SHOW, SUMMARIZE, or PIVOT statement.'; return; }
  status.textContent = 'Running locally…'; result.replaceChildren();
  try {
    const limited = /^(SELECT|WITH|PIVOT)\b/i.test(sql) ? `SELECT * FROM (${sql}) AS glassline_result LIMIT 1000` : sql;
    const start = performance.now(); const rows = await engine!.query(limited); renderResultTable(result, rows); status.textContent = `${formatNumber(rows.length)} rows · ${Math.round(performance.now() - start)} ms`;
  } catch (error) { status.textContent = friendlyError(error); }
}

async function exportView(): Promise<void> {
  const button = $<HTMLButtonElement>('#export-now'); const checked = document.querySelector<HTMLInputElement>('input[name="format"]:checked')!; const format = checked.value as 'csv' | 'parquet';
  button.disabled = true; button.textContent = 'Building file…';
  try {
    const bytes = await engine!.export(buildDataQuery(filters, columns, sort), format);
    const blob = new Blob([bytes as BlobPart], { type: format === 'csv' ? 'text/csv' : 'application/vnd.apache.parquet' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `glassline-export-${new Date().toISOString().slice(0, 10)}.${format}`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    exportDialog.close(); showToast(`Exported ${format.toUpperCase()} locally.`);
  } catch (error) { showToast(friendlyError(error)); }
  finally { button.disabled = false; button.textContent = 'Export file'; }
}

function resetApp(): void {
  loadSequence++;
  const previousEngine = engine; engine = null; void previousEngine?.close().catch(() => undefined); currentFile = null; columns = []; filters = []; sort = null; rowCount = null;
  workspace.hidden = true; landing.hidden = false; $('#site-footer').hidden = false; fileInput.value = '';
  document.querySelectorAll<HTMLElement>('.only-workspace').forEach((item) => { item.hidden = true; });
  replaceHeading('workspace-title', 2);
  replaceHeading('hero-title', 1);
  $('#route-status').textContent = 'Glassline home';
  updateNetwork();
}

async function openDemo(): Promise<void> {
  try {
    const response = await fetch('/sample-orders.csv');
    if (!response.ok) throw new Error('The sample file could not be loaded.');
    const file = new File([await response.blob()], 'sample-orders.csv', { type: 'text/csv' });
    await openFile(file);
  } catch (error) {
    hideLoading();
    showToast(error instanceof Error ? error.message : 'The sample file could not be loaded. Reload and try again.');
  }
}

async function resetDemo(): Promise<void> {
  loadSequence++;
  const previousEngine = engine;
  engine = null;
  await previousEngine?.close().catch(() => undefined);
  currentFile = null; columns = []; filters = []; sort = null; rowCount = null;
  workspace.hidden = true;
  await openDemo();
  showToast('Demo restored to the original 40 orders.');
}

fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (file) void openFile(file); });
dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); } });
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', (event) => { const file = (event as DragEvent).dataTransfer?.files[0]; if (file) void openFile(file); });
$('#cancel-load').addEventListener('click', () => { resetApp(); hideLoading(); });
$('#new-file').addEventListener('click', resetApp);
$('#reset-demo').addEventListener('click', () => void resetDemo());
$('#column-search').addEventListener('input', (event) => renderColumns((event.target as HTMLInputElement).value));
$('#close-stats').addEventListener('click', () => { $('#stats-panel').hidden = true; });
$('#open-filter').addEventListener('click', () => { renderFilterBuilder(); filterDialog.showModal(); });
$('#add-filter').addEventListener('click', () => { filters.push({ id: ruleSequence++, column: columns[0]?.name ?? '', operator: 'contains', value: '' }); renderFilterBuilder(); });
$('#apply-filter').addEventListener('click', (event) => { event.preventDefault(); filters = filters.filter((rule) => rule.operator.startsWith('is') || rule.value.trim()); filterDialog.close(); void refreshView(); });
$('#clear-view').addEventListener('click', () => { filters = []; sort = null; void refreshView(); });
$('#open-analysis').addEventListener('click', () => { analysisMode = 'group'; renderAnalysisFields(); analysisDialog.showModal(); });
$('#group-tab').addEventListener('click', () => { analysisMode = 'group'; $('#group-tab').setAttribute('aria-selected', 'true'); $('#pivot-tab').setAttribute('aria-selected', 'false'); renderAnalysisFields(); });
$('#pivot-tab').addEventListener('click', () => { analysisMode = 'pivot'; $('#pivot-tab').setAttribute('aria-selected', 'true'); $('#group-tab').setAttribute('aria-selected', 'false'); renderAnalysisFields(); });
$('#run-analysis').addEventListener('click', () => void runAnalysis());
$('#open-sql').addEventListener('click', () => sqlDialog.showModal());
$('#run-sql').addEventListener('click', () => void runSql());
$('#open-export').addEventListener('click', () => exportDialog.showModal());
$('#export-now').addEventListener('click', () => void exportView());
$<HTMLInputElement>('#jump-row').addEventListener('change', (event) => { const row = Number((event.target as HTMLInputElement).value); if (Number.isFinite(row)) void loadPage(Math.max(0, Math.floor(row) - 1)); });
$('#retry-import').addEventListener('click', () => {
  importOptions = { delimiter: $<HTMLSelectElement>('#delimiter').value as CsvOptions['delimiter'], header: $<HTMLInputElement>('#has-header').checked, allVarchar: $<HTMLInputElement>('#all-text').checked };
  errorDialog.close(); if (currentFile) void openFile(currentFile);
});
$('#choose-another').addEventListener('click', () => { errorDialog.close(); fileInput.value = ''; fileInput.click(); });
errorDialog.addEventListener('close', () => { if (!workspace.hidden) return; fileInput.value = ''; });

document.addEventListener('keydown', (event) => {
  if (workspace.hidden || event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) return;
  if (event.key === '/') { event.preventDefault(); $('#open-filter').click(); }
  if (event.key.toLowerCase() === 'g') { event.preventDefault(); gridScroll.focus(); }
  if (event.key.toLowerCase() === 'e') { event.preventDefault(); exportDialog.showModal(); }
});

function updateNetwork(): void {
  $('#network-label').textContent = navigator.onLine ? (workspace.hidden ? 'Ready locally' : 'On this device') : 'Offline · still local';
  document.body.classList.toggle('offline', !navigator.onLine);
}
window.addEventListener('online', updateNetwork); window.addEventListener('offline', updateNetwork); updateNetwork();

async function prepareServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, 2500);
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.clearTimeout(timer); resolve(); }, { once: true });
    });
  }
  const urls = performance.getEntriesByType('resource').map((entry) => entry.name).filter((url) => new URL(url).origin === location.origin);
  registration.active?.postMessage({ type: 'CACHE_URLS', urls });
}

setRouteMetadata(demoMode);
if (demoMode) {
  $('#demo-banner').hidden = false;
  document.body.classList.add('demo-mode');
  $('#route-status').textContent = 'Demo workspace loading';
  void prepareServiceWorker().catch(() => undefined).then(openDemo);
} else {
  void prepareServiceWorker().catch(() => undefined);
}
