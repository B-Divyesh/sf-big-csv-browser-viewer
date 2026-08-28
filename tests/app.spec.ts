import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { strToU8, zipSync } from 'fflate';
import { readFileSync } from 'node:fs';

const staticWebAppConfig = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
  globalHeaders: { 'Content-Security-Policy': string };
};

const csv = `region,status,amount,date\nNorth,Won,1200,2026-01-03\nSouth,Lost,500,2026-01-04\nNorth,Won,800,2026-01-05\nWest,Open,250,2026-01-06\n`;
const quotedMultilineCsv = 'region,note\nNorth,"first line\nsecond line"\nSouth,plain\n';
const quotedMultilineCrlfCsv = 'region,note\r\nNorth,"first line\r\nsecond line"\r\nSouth,plain\r\n';

function tinyXlsx(): Buffer {
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    'xl/workbook.xml': strToU8('<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Orders" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    'xl/worksheets/sheet1.xml': strToU8('<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:B3"/><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>region</t></is></c><c r="B1" t="inlineStr"><is><t>amount</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>North</t></is></c><c r="B2"><v>1200</v></c></row><row r="3"><c r="A3" t="inlineStr"><is><t>South</t></is></c><c r="B3"><v>500</v></c></row></sheetData></worksheet>'),
  };
  return Buffer.from(zipSync(files));
}

type CompactValue = bigint | number | string | CompactStruct | CompactValue[];
type CompactStruct = Map<number, CompactValue>;

// Parquet stores its FileMetaData as Apache Thrift's compact protocol. This
// deliberately small reader validates the downloaded file itself instead of
// merely asserting the browser emitted a .parquet download.
function parquetMetadata(bytes: Buffer): CompactStruct {
  expect(bytes.subarray(0, 4).toString()).toBe('PAR1');
  expect(bytes.subarray(-4).toString()).toBe('PAR1');
  const footerLength = bytes.readUInt32LE(bytes.length - 8);
  const footerStart = bytes.length - 8 - footerLength;
  expect(footerStart).toBeGreaterThan(4);
  let offset = footerStart;
  const readByte = () => bytes[offset++]!;
  const readVarint = (): bigint => {
    let value = 0n; let shift = 0n; let next: number;
    do { next = readByte(); value |= BigInt(next & 0x7f) << shift; shift += 7n; } while (next & 0x80);
    return value;
  };
  const readZigZag = () => { const value = readVarint(); return (value >> 1n) ^ (-(value & 1n)); };
  const readValue = (type: number): CompactValue => {
    if (type === 1) return 1;
    if (type === 2) return 0;
    if (type === 3) return readByte();
    if (type === 4 || type === 5 || type === 6) return readZigZag();
    if (type === 7) { offset += 8; return 0; }
    if (type === 8) { const length = Number(readVarint()); const value = bytes.subarray(offset, offset + length).toString(); offset += length; return value; }
    if (type === 9 || type === 10) {
      const header = readByte(); const length = header >> 4; const count = length === 15 ? Number(readVarint()) : length; const elementType = header & 0x0f;
      return Array.from({ length: count }, () => readValue(elementType));
    }
    if (type === 11) {
      const count = Number(readVarint()); if (!count) return [];
      const types = readByte(); return Array.from({ length: count }, () => [readValue(types >> 4), readValue(types & 0x0f)] as CompactValue);
    }
    if (type === 12) return readStruct();
    throw new Error(`Unsupported Parquet metadata field type ${type}`);
  };
  const readStruct = (): CompactStruct => {
    const fields: CompactStruct = new Map(); let previousField = 0;
    for (;;) {
      const header = readByte(); if (header === 0) return fields;
      const type = header & 0x0f; const delta = header >> 4;
      const field = delta ? previousField + delta : Number(readVarint()); previousField = field;
      fields.set(field, readValue(type));
    }
  };
  return readStruct();
}

async function downloadBytes(download: import('@playwright/test').Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error('The Parquet download stream was unavailable.');
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function openDemo(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { level: 1, name: 'sample-orders.csv' })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#row-count')).toContainText('40 rows');
}

test('landing page is accessible and responsive', async ({ page }) => {
  const response = await page.goto('/');
  // Vite preview serves this exact production policy (see vite.config.ts), so
  // the successful DuckDB tests below prove the live browser CSP permits WASM.
  expect(response?.headers()['content-security-policy']).toBe(staticWebAppConfig.globalHeaders['Content-Security-Policy']);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Filter large CSV files');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('@claim:offline-reload reopens the sample workspace offline after the first visit', async ({ page, context }) => {
  await openDemo(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'sample-orders.csv' })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#row-count')).toContainText('40 rows');
  await context.setOffline(false);
});

test('@claim:core-workflow filters, summarizes, pivots and queries the sample file', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await openDemo(page);
  await expect(page.getByRole('gridcell', { name: 'North', exact: true }).first()).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) > 720) {
    await page.locator('#column-list .column-item').filter({ hasText: 'revenue' }).click();
    await expect(page.locator('#stats-title')).toHaveText('revenue');
    await page.getByRole('button', { name: 'Close column statistics' }).click();
  }
  await page.getByRole('columnheader', { name: 'revenue' }).click();
  await expect(page.locator('#filter-chips')).toContainText('revenue ascending');
  const workspaceA11y = await new AxeBuilder({ page }).analyze();
  expect(workspaceA11y.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Filter rows' });
  await dialog.locator('select').nth(0).selectOption('region');
  await dialog.locator('select').nth(1).selectOption('equals');
  await dialog.locator('input').fill('North');
  await dialog.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('#row-count')).toContainText('10 rows');

  await page.getByRole('button', { name: 'Group and pivot' }).click();
  const analysis = page.getByRole('dialog', { name: 'Group & pivot' });
  await analysis.locator('#group-column').selectOption('status');
  await analysis.getByRole('button', { name: 'Run summary' }).click();
  await expect(analysis.getByRole('cell', { name: 'Shipped' })).toBeVisible();
  await analysis.getByRole('tab', { name: 'Pivot' }).click();
  await analysis.locator('#pivot-row').selectOption('owner');
  await analysis.locator('#pivot-column').selectOption('status');
  await analysis.getByRole('button', { name: 'Run summary' }).click();
  await expect(analysis.getByRole('columnheader', { name: 'Shipped' })).toBeVisible();
  await analysis.getByRole('button', { name: 'Close analysis' }).click();

  await page.getByRole('button', { name: 'SQL query' }).click();
  const sqlDialog = page.getByRole('dialog', { name: 'Query with SQL' });
  await sqlDialog.locator('textarea').fill('SELECT region, SUM(revenue) AS total FROM data GROUP BY region ORDER BY total DESC');
  await sqlDialog.getByRole('button', { name: 'Run query' }).click();
  await expect(sqlDialog.getByRole('cell', { name: '17131' })).toBeVisible();
  await sqlDialog.getByRole('button', { name: 'Close SQL' }).click();
  expect(consoleErrors).toEqual([]);
});

test('@claim:demo-sandbox opens 40 sample orders, saves nothing and resets cleanly', async ({ page }) => {
  await openDemo(page);
  const banner = page.getByLabel('Demo mode');
  await expect(banner.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Filter rows' }).click();
  const dialog = page.getByRole('dialog', { name: 'Filter rows' });
  await dialog.locator('select').nth(0).selectOption('region');
  await dialog.locator('select').nth(1).selectOption('equals');
  await dialog.locator('input').fill('North');
  await dialog.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('#row-count')).toContainText('10 rows');
  await banner.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#row-count')).toContainText('40 rows');
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] });
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Filter rows' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export view' })).toBeEnabled();
  await banner.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Filter large CSV files/ })).toBeVisible();
  await expect(banner).toBeHidden();
});

test('@claim:local-processing keeps the complete demo workflow on the site origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await openDemo(page);
  await page.getByRole('button', { name: 'Filter rows' }).click();
  const filter = page.getByRole('dialog', { name: 'Filter rows' });
  await filter.locator('select').nth(0).selectOption('status');
  await filter.locator('select').nth(1).selectOption('equals');
  await filter.locator('input').fill('Shipped');
  await filter.getByRole('button', { name: 'Apply filters' }).click();
  await page.getByRole('button', { name: 'Group and pivot' }).click();
  await page.getByRole('dialog', { name: 'Group & pivot' }).getByRole('button', { name: 'Run summary' }).click();
  await page.getByRole('button', { name: 'Close analysis' }).click();
  await page.getByRole('button', { name: 'SQL query' }).click();
  await page.getByRole('dialog', { name: 'Query with SQL' }).getByRole('button', { name: 'Run query' }).click();
  await page.getByRole('button', { name: 'Close SQL' }).click();
  await page.getByRole('button', { name: 'Export view' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export file' }).click();
  await downloadPromise;
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  const cachedPaths = await page.evaluate(async () => {
    const paths: string[] = [];
    for (const cacheName of await caches.keys()) {
      for (const request of await (await caches.open(cacheName)).keys()) paths.push(new URL(request.url).pathname);
    }
    return paths;
  });
  expect(cachedPaths.some((path) => path.includes('glassline-export') || path.includes('source.csv'))).toBe(false);
});

test('@claim:csv-export exports only filtered sample rows with the original columns', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Filter rows' }).click();
  const filter = page.getByRole('dialog', { name: 'Filter rows' });
  await filter.locator('select').nth(0).selectOption('region');
  await filter.locator('select').nth(1).selectOption('equals');
  await filter.locator('input').fill('North');
  await filter.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('#row-count')).toContainText('10 rows');
  await page.getByRole('button', { name: 'Export view' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export file' }).click();
  const text = (await downloadBytes(await downloadPromise)).toString('utf8').trim();
  const lines = text.split(/\r?\n/);
  expect(lines[0]).toBe('order_id,ordered_at,region,channel,status,customer,category,units,revenue,cost,owner');
  expect(lines).toHaveLength(11);
  expect(lines.slice(1).every((line) => line.includes(',North,'))).toBe(true);
});

test('opens RFC-style quoted multiline CSV fields without relaxing malformed-quote checks', async ({ page }) => {
  for (const [name, source] of [
    ['quoted-multiline.csv', quotedMultilineCsv],
    ['quoted-multiline-crlf.csv', quotedMultilineCrlfCsv],
  ]) {
    await page.goto('/');
    await page.locator('#file-input').setInputFiles({ name, mimeType: 'text/csv', buffer: Buffer.from(source) });
    await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('#row-count')).toContainText('2 rows');
    await expect(page.locator('#error-dialog')).not.toHaveAttribute('open', '');
    await expect(page.getByRole('gridcell', { name: /first line\s+second line/ })).toBeVisible();
  }
});

test('@claim:mobile-controls keeps every workspace action tappable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(390);
  await expect(page.getByRole('heading', { name: 'sample-orders.csv' })).toBeVisible({ timeout: 45_000 });

  const actions = ['Filter rows', 'Group and pivot', 'SQL query', 'Export view'];
  const boxes = await Promise.all(actions.map(async (name) => {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box, `${name} should be visible in the mobile toolbar`).not.toBeNull();
    expect(box!.width, `${name} target width`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `${name} target height`).toBeGreaterThanOrEqual(44);
    return box!;
  }));

  for (let index = 1; index < boxes.length; index += 1) {
    expect(boxes[index]!.x - (boxes[index - 1]!.x + boxes[index - 1]!.width), 'adjacent targets need 8px separation').toBeGreaterThanOrEqual(8);
  }
  await page.keyboard.press('/');
  await expect(page.getByRole('dialog', { name: 'Filter rows' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog', { name: 'Export this view' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('@claim:parquet-export exports the filtered sample view as valid Parquet', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Filter rows' }).click();
  const filterDialog = page.getByRole('dialog', { name: 'Filter rows' });
  await filterDialog.locator('select').nth(0).selectOption('region');
  await filterDialog.locator('select').nth(1).selectOption('equals');
  await filterDialog.locator('input').fill('North');
  await filterDialog.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('#row-count')).toContainText('10 rows');

  await page.getByRole('button', { name: 'Export view' }).click();
  const dialog = page.getByRole('dialog', { name: 'Export this view' });
  await dialog.getByRole('radio', { name: 'Parquet Smaller, typed data' }).check();
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Export file' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.parquet$/);

  const metadata = parquetMetadata(await downloadBytes(download));
  expect(metadata.get(3)).toBe(10n); // FileMetaData.num_rows
  const schema = metadata.get(2) as CompactValue[]; // FileMetaData.schema
  expect((schema[0] as CompactStruct).get(5)).toBe(11n); // root SchemaElement.num_children
  expect(schema).toHaveLength(12); // root plus the 11 sample columns
  expect(metadata.get(4)).toHaveLength(1); // one row group for this small export
  await expect(dialog).toBeHidden();
});

test('opens the first worksheet from XLSX', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({ name: 'orders.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: tinyXlsx() });
  await expect(page.getByRole('heading', { name: 'orders.xlsx' })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#row-count')).toContainText('2 rows');
  await expect(page.getByRole('gridcell', { name: 'North' })).toBeVisible();
});

test('opens a tab-separated file', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({
    name: 'orders.tsv',
    mimeType: 'text/tab-separated-values',
    buffer: Buffer.from('region\tamount\nNorth\t1200\nSouth\t500\n'),
  });
  await expect(page.getByRole('heading', { name: 'orders.tsv' })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#row-count')).toContainText('2 rows');
  await expect(page.getByRole('gridcell', { name: 'North' })).toBeVisible();
});

test('@claim:supported-file-formats opens CSV, TSV, TXT and the first XLSX worksheet', async ({ page }) => {
  const files = [
    { name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from(csv), expected: '4 rows' },
    { name: 'orders.tsv', mimeType: 'text/tab-separated-values', buffer: Buffer.from('region\tamount\nNorth\t1200\nSouth\t500\n'), expected: '2 rows' },
    { name: 'orders.txt', mimeType: 'text/plain', buffer: Buffer.from('region,status\nNorth,Won\nSouth,Lost\n'), expected: '2 rows' },
    { name: 'orders.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: tinyXlsx(), expected: '2 rows' },
  ];
  await page.goto('/?demo=1');
  await page.getByLabel('Demo mode').getByRole('link', { name: 'Start for real' }).click();
  for (const file of files) {
    await page.locator('#file-input').setInputFiles(file);
    await expect(page.getByRole('heading', { level: 1, name: file.name })).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('#row-count')).toContainText(file.expected);
    await page.getByRole('button', { name: 'Open another file' }).click();
  }
  await page.locator('#file-input').setInputFiles(files[0]);
  await expect(page.getByRole('heading', { level: 1, name: 'orders.csv' })).toBeVisible({ timeout: 45_000 });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: /Filter large CSV files/ })).toBeVisible();
});

test('routes have unique metadata, shared navigation, focus and a designed 404', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Glassline — Filter large CSV files in your browser');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://big-csv-browser-viewer.sociobot.in/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /glassline-social\.jpg$/);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveTitle('Demo — Glassline');
  await expect(page.getByRole('heading', { level: 1, name: 'sample-orders.csv' })).toBeFocused({ timeout: 45_000 });
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Glassline');
  await expect(page.locator('#row-count')).toContainText('40 rows', { timeout: 45_000 });

  for (const route of ['/privacy/', '/terms/']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
    const routeA11y = await new AxeBuilder({ page }).analyze();
    expect(routeA11y.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }

  const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8'));
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Glassline');
  await expect(page.getByRole('heading', { level: 1, name: 'This page has no rows.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Glassline' })).toHaveAttribute('href', '/');
  const notFoundA11y = await new AxeBuilder({ page }).analyze();
  expect(notFoundA11y.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('recovers visibly when the local engine cannot initialize', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    class FailingWorker extends NativeWorker {
      constructor(...args: ConstructorParameters<typeof Worker>) {
        super(...args);
        window.setTimeout(() => this.dispatchEvent(new ErrorEvent('error', { message: 'Test engine initialization failure' })), 0);
      }
    }
    window.Worker = FailingWorker;
  });
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({ name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  const dialog = page.getByRole('dialog', { name: 'Local engine could not start' });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await expect(dialog.getByText('Nothing was uploaded.')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Retry engine' })).toBeVisible();
  await expect(page.locator('#loading-layer')).toBeHidden();
  await expect(page.locator('#workspace')).toBeHidden();
});

test('rejects an unterminated quoted CSV with visible recovery controls', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({
    name: 'broken.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,name\n1,"unclosed\n2,still here\n'),
  });
  const dialog = page.getByRole('dialog', { name: 'Check the import settings' });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await expect(dialog.getByText('The rows do not appear to use one consistent CSV structure.')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Choose another file' })).toBeVisible();
  await expect(page.locator('#workspace')).toBeHidden();
});
