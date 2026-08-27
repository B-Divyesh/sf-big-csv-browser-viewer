import { createWriteStream, existsSync, statSync } from 'node:fs';
import { once } from 'node:events';
import { chromium } from 'playwright';

const rows = Number(process.env.GLASSLINE_BENCH_ROWS || 5_000_000);
const pad = Number(process.env.GLASSLINE_BENCH_PAD || 0);
const path = `/tmp/glassline-${rows}-rows-${pad}-pad.csv`;

if (!existsSync(path)) {
  const output = createWriteStream(path);
  output.write('row_id,region,status,amount,event_date,reference\n');
  for (let index = 1; index <= rows; index++) {
    if (!output.write(`${index},Region ${index % 25},${index % 3 ? 'Open' : 'Closed'},${(index % 100000) / 100},2026-01-${String((index % 28) + 1).padStart(2, '0')},REF-${index}${'x'.repeat(pad)}\n`)) await once(output, 'drain');
  }
  output.end();
  await once(output, 'finish');
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://127.0.0.1:4173');
const started = performance.now();
await page.locator('#file-input').setInputFiles(path);
await page.locator('#workspace-title').waitFor({ state: 'visible', timeout: 120_000 });
await page.locator('#row-count').filter({ hasText: new Intl.NumberFormat().format(rows) }).waitFor({ timeout: 120_000 });
const elapsed = (performance.now() - started) / 1000;
console.log(JSON.stringify({ rows, bytes: statSync(path).size, openAndCountSeconds: Number(elapsed.toFixed(2)) }));
await browser.close();
