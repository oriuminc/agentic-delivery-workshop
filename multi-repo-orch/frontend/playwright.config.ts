import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

// Ports differ from `./dev.sh` (4000/5173) so e2e never collides with a running dev stack.
// Parallel worktrees set E2E_API_PORT / E2E_WEB_PORT to stay apart.
const apiPort = Number(process.env.E2E_API_PORT ?? 4100);
const webPort = Number(process.env.E2E_WEB_PORT ?? 5273);
const dir = join(tmpdir(), `folio-e2e-${webPort}`); // throw-away DB + log, never data/db.json

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // one shared backend DB
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['line']] : [['list']],
  outputDir: process.env.E2E_OUTPUT_DIR || './test-results',
  use: {
    baseURL: `http://localhost:${webPort}`,
    channel: 'chrome', // the real Chrome install, not bundled Chromium
    headless: true, // HEADED=1 shows the browser window
    trace: 'retain-on-failure',
    screenshot: process.env.E2E_EVIDENCE ? 'on' : 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run -s start',
      cwd: '../backend',
      url: `http://localhost:${apiPort}/api/health`,
      env: { PORT: String(apiPort), DB_FILE: join(dir, 'db.json'), LOG_FILE: join(dir, 'app.log') },
      reuseExistingServer: false,
    },
    {
      command: `npx vite --port ${webPort} --strictPort`,
      url: `http://localhost:${webPort}`,
      env: { API_URL: `http://localhost:${apiPort}` },
      reuseExistingServer: false,
    },
  ],
});
