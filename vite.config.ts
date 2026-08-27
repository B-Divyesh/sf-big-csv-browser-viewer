import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

// Vite preview is used for browser regression coverage. Keep its document
// headers identical to Azure Static Web Apps so DuckDB-WASM is tested under
// the policy that users receive, rather than under Vite's permissive default.
const staticWebAppConfig = JSON.parse(
  readFileSync(new URL('./public/staticwebapp.config.json', import.meta.url), 'utf8'),
) as { globalHeaders: Record<string, string> };

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 5000,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
  preview: {
    headers: staticWebAppConfig.globalHeaders,
  },
});
