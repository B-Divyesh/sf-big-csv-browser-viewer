import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Every CSV workflow starts an isolated DuckDB-WASM worker. Parallel pages
  // can exhaust Chromium's WASM/worker resources, so serial is intentional.
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
