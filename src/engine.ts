import * as duckdb from '@duckdb/duckdb-wasm';
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import type { ColumnInfo } from './query';
import { inspectCsvQuotes } from './csv-validation';

type QueryRow = Record<string, unknown>;

export class EngineInitializationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'EngineInitializationError';
  }
}

const bundles: duckdb.DuckDBBundles = {
  mvp: { mainModule: mvpWasm, mainWorker: mvpWorker },
  eh: { mainModule: ehWasm, mainWorker: ehWorker },
};

const normalizeValue = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array) return `[${value.byteLength} bytes]`;
  return value;
};

const tableRows = (table: Awaited<ReturnType<duckdb.AsyncDuckDBConnection['query']>>): QueryRow[] =>
  table.toArray().map((row) => Object.fromEntries(Object.entries(row.toJSON()).map(([key, value]) => [key, normalizeValue(value)])));

export interface CsvOptions {
  delimiter: 'auto' | ',' | '\t' | ';' | '|';
  header: boolean;
  allVarchar: boolean;
}

export interface OpenResult {
  columns: ColumnInfo[];
  preview: QueryRow[];
  sourceFile: File;
}

export class LocalDataEngine {
  private db: duckdb.AsyncDuckDB | null = null;
  private connection: duckdb.AsyncDuckDBConnection | null = null;
  private initializing: Promise<void> | null = null;
  private parquetReady = false;

  async initialize(progress?: (percent: number) => void): Promise<void> {
    if (this.db) return;
    if (this.initializing) return this.initializing;

    this.initializing = this.start(progress);
    try {
      await this.initializing;
    } finally {
      this.initializing = null;
    }
  }

  private async start(progress?: (percent: number) => void): Promise<void> {
    let worker: Worker | null = null;
    let database: duckdb.AsyncDuckDB | null = null;
    try {
      const bundle = await duckdb.selectBundle(bundles);
      if (!bundle.mainWorker) throw new EngineInitializationError('This browser cannot start the local data engine.');
      worker = new Worker(bundle.mainWorker);
      database = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);

      // A CSP-blocked WASM module can otherwise leave the worker promise open
      // forever. Surface worker failures and a finite startup timeout so the
      // import UI can offer a real retry instead of an endless loading layer.
      let rejectWorkerFailure!: (reason: Error) => void;
      const workerFailure = new Promise<never>((_, reject) => { rejectWorkerFailure = reject; });
      const onWorkerError = (event: ErrorEvent) => rejectWorkerFailure(new EngineInitializationError(event.message || 'The local engine worker stopped before it could start.'));
      const onWorkerMessageError = () => rejectWorkerFailure(new EngineInitializationError('The local engine worker could not communicate with this browser.'));
      worker.addEventListener('error', onWorkerError, { once: true });
      worker.addEventListener('messageerror', onWorkerMessageError, { once: true });
      let timeoutId = 0;
      const startupTimeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new EngineInitializationError('Starting the local engine took too long. Check your connection, then try again.')), 30_000);
      });

      try {
        await Promise.race([
          database.instantiate(bundle.mainModule, bundle.pthreadWorker, (entry) => {
            if (entry.bytesTotal > 0) progress?.(Math.round((entry.bytesLoaded / entry.bytesTotal) * 100));
          }),
          workerFailure,
          startupTimeout,
        ]);
      } finally {
        window.clearTimeout(timeoutId);
        worker.removeEventListener('error', onWorkerError);
        worker.removeEventListener('messageerror', onWorkerMessageError);
      }
      await database.open({ path: ':memory:', query: { castBigIntToDouble: false } });
      this.db = database;
      this.connection = await database.connect();
    } catch (error) {
      await database?.terminate().catch(() => undefined);
      worker?.terminate();
      if (error instanceof EngineInitializationError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new EngineInitializationError(`The local data engine could not start: ${message}`, { cause: error });
    }
  }

  private async xlsxToCsv(file: File): Promise<File> {
    const { readSheet } = await import('read-excel-file/browser');
    const rows = await readSheet(file);
    if (!rows.length) throw new Error('The first worksheet is empty.');
    const csv = rows.map((row) => row.map((cell) => {
      const value = cell == null ? '' : cell instanceof Date ? cell.toISOString() : String(cell);
      return `"${value.replaceAll('"', '""')}"`;
    }).join(',')).join('\n');
    return new File([csv], `${file.name}.csv`, { type: 'text/csv' });
  }

  async open(file: File, options: CsvOptions, progress?: (percent: number) => void): Promise<OpenResult> {
    // DuckDB intentionally recovers from some malformed quote sequences. That
    // is useful for exploratory SQL, but wrong for an import UI that promises
    // a visible recovery path. Validate text sources before opening the view.
    const quoteInspection = /\.xlsx$/i.test(file.name)
      ? { hasQuotedNewline: false }
      : await inspectCsvQuotes(file, options.delimiter);
    await this.initialize(progress);
    if (!this.db || !this.connection) throw new Error('The local data engine did not start.');
    await this.db.dropFile('source.csv').catch(() => undefined);
    const sourceFile = /\.xlsx$/i.test(file.name) ? await this.xlsxToCsv(file) : file;
    await this.db.registerFileHandle('source.csv', sourceFile, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    const delimiter = options.delimiter === 'auto' ? '' : `, delim = '${options.delimiter === '\t' ? '\\t' : options.delimiter}'`;
    // DuckDB's parallel scanner intentionally rejects null_padding alongside
    // quoted CR/LF fields. The validator above has already confirmed that the
    // CSV is structurally valid, so only those files use DuckDB's compatible
    // single-reader path; ordinary large CSVs retain parallel import speed.
    const parallel = quoteInspection.hasQuotedNewline ? 'false' : 'true';
    const sql = `CREATE OR REPLACE VIEW data AS SELECT * FROM read_csv('source.csv', auto_detect = true, header = ${options.header}, all_varchar = ${options.allVarchar}, sample_size = 200000, null_padding = true, parallel = ${parallel}${delimiter})`;
    await this.connection.query(sql);
    const described = tableRows(await this.connection.query('DESCRIBE data'));
    const columns = described.map((row) => ({ name: String(row.column_name), type: String(row.column_type) }));
    if (!columns.length) throw new Error('No columns were found. Check the delimiter and header settings.');
    const preview = tableRows(await this.connection.query('SELECT * FROM data LIMIT 100'));
    return { columns, preview, sourceFile };
  }

  async query(sql: string): Promise<QueryRow[]> {
    if (!this.connection) throw new Error('Open a file first.');
    return tableRows(await this.connection.query(sql));
  }

  async count(where = ''): Promise<number> {
    const [row] = await this.query(`SELECT COUNT(*) AS total FROM data${where}`);
    return Number(row?.total ?? 0);
  }

  private async loadLocalParquetExtension(): Promise<void> {
    if (this.parquetReady || !this.db || !this.connection) return;
    // DuckDB-WASM loads Parquet as an extension. Point its extension resolver
    // at the matching extension version shipped with this app, so LOAD stays
    // same-origin and never needs a third-party request or wider connect-src.
    const repository = new URL('/duckdb-extensions', window.location.origin).toString();
    await this.connection.query(`SET custom_extension_repository = '${repository}'`);
    await this.connection.query('LOAD parquet');
    this.parquetReady = true;
  }

  async export(sql: string, format: 'csv' | 'parquet'): Promise<Uint8Array> {
    if (!this.connection || !this.db) throw new Error('Open a file first.');
    if (format === 'parquet') await this.loadLocalParquetExtension();
    const filename = `glassline-export.${format}`;
    await this.db.dropFile(filename).catch(() => undefined);
    const options = format === 'csv' ? `(FORMAT CSV, HEADER, DELIMITER ',')` : '(FORMAT PARQUET, COMPRESSION ZSTD)';
    await this.connection.query(`COPY (${sql}) TO '${filename}' ${options}`);
    return this.db.copyFileToBuffer(filename);
  }

  async close(): Promise<void> {
    await this.connection?.close();
    await this.db?.terminate();
    this.connection = null;
    this.db = null;
    this.parquetReady = false;
  }
}
