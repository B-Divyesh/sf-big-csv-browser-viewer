import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { strToU8, zipSync } from 'fflate';
import { readFileSync } from 'node:fs';

const staticWebAppConfig = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
  globalHeaders: { 'Content-Security-Policy': string };
};

const csv = `region,status,amount,date\nNorth,Won,1200,2026-01-03\nSouth,Lost,500,2026-01-04\nNorth,Won,800,2026-01-05\nWest,Open,250,2026-01-06\n`;

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

test('landing page is accessible and responsive', async ({ page }) => {
  const response = await page.goto('/');
  // Vite preview serves this exact production policy (see vite.config.ts), so
  // the successful DuckDB tests below prove the live browser CSP permits WASM.
  expect(response?.headers()['content-security-policy']).toBe(staticWebAppConfig.globalHeaders['Content-Security-Policy']);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your biggest CSV');
  await expect(page.getByText('Never uploaded')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('reopens the cached shell offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise((resolve) => window.setTimeout(resolve, 500));
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your biggest CSV');
  await context.setOffline(false);
});

test('opens, filters, summarizes, queries and exports CSV', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await page.locator('#file-input').setInputFiles({ name: 'orders.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByRole('heading', { name: 'orders.csv' })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#row-count')).toContainText('4 rows');
  await expect(page.getByRole('gridcell', { name: 'North', exact: true }).first()).toBeVisible();
  const workspaceA11y = await new AxeBuilder({ page }).analyze();
  expect(workspaceA11y.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Filter rows' });
  await dialog.locator('select').nth(0).selectOption('region');
  await dialog.locator('select').nth(1).selectOption('equals');
  await dialog.locator('input').fill('North');
  await dialog.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page.locator('#row-count')).toContainText('2 rows');

  await page.getByRole('button', { name: 'Group and pivot' }).click();
  const analysis = page.getByRole('dialog', { name: 'Group & pivot' });
  await analysis.locator('#group-column').selectOption('status');
  await analysis.getByRole('button', { name: 'Run summary' }).click();
  await expect(analysis.getByRole('cell', { name: 'Won' })).toBeVisible();
  await analysis.getByRole('tab', { name: 'Pivot' }).click();
  await analysis.locator('#pivot-row').selectOption('region');
  await analysis.locator('#pivot-column').selectOption('status');
  await analysis.getByRole('button', { name: 'Run summary' }).click();
  await expect(analysis.getByRole('columnheader', { name: 'Won' })).toBeVisible();
  await analysis.getByRole('button', { name: 'Close analysis' }).click();

  await page.getByRole('button', { name: 'SQL query' }).click();
  const sqlDialog = page.getByRole('dialog', { name: 'Query with SQL' });
  await sqlDialog.locator('textarea').fill('SELECT region, SUM(amount) AS total FROM data GROUP BY region ORDER BY total DESC');
  await sqlDialog.getByRole('button', { name: 'Run query' }).click();
  await expect(sqlDialog.getByRole('cell', { name: '2000' })).toBeVisible();
  await sqlDialog.getByRole('button', { name: 'Close SQL' }).click();

  await page.keyboard.press('e');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('dialog', { name: 'Export this view' }).getByRole('button', { name: 'Export file' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  expect(consoleErrors).toEqual([]);
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
