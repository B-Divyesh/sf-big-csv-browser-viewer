import * as duckdb from '@duckdb/duckdb-wasm';
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import type { ColumnInfo } from './query';

type QueryRow = Record<string, unknown>;

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

  async initialize(progress?: (percent: number) => void): Promise<void> {
    if (this.db) return;
    const bundle = await duckdb.selectBundle(bundles);
    if (!bundle.mainWorker) throw new Error('This browser cannot start the local data engine.');
    const worker = new Worker(bundle.mainWorker);
    const database = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
    await database.instantiate(bundle.mainModule, bundle.pthreadWorker, (entry) => {
      if (entry.bytesTotal > 0) progress?.(Math.round((entry.bytesLoaded / entry.bytesTotal) * 100));
    });
    await database.open({ path: ':memory:', query: { castBigIntToDouble: false } });
    this.db = database;
    this.connection = await database.connect();
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
    await this.initialize(progress);
    if (!this.db || !this.connection) throw new Error('The local data engine did not start.');
    await this.db.dropFile('source.csv').catch(() => undefined);
    const sourceFile = /\.xlsx$/i.test(file.name) ? await this.xlsxToCsv(file) : file;
    await this.db.registerFileHandle('source.csv', sourceFile, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    const delimiter = options.delimiter === 'auto' ? '' : `, delim = '${options.delimiter === '\t' ? '\\t' : options.delimiter}'`;
    const sql = `CREATE OR REPLACE VIEW data AS SELECT * FROM read_csv('source.csv', auto_detect = true, header = ${options.header}, all_varchar = ${options.allVarchar}, sample_size = 200000, null_padding = true${delimiter})`;
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

  async export(sql: string, format: 'csv' | 'parquet'): Promise<Uint8Array> {
    if (!this.connection || !this.db) throw new Error('Open a file first.');
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
  }
}
