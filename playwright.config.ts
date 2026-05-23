import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  projects: [
    {
      name: 'chromium',
      use: {
        viewport: { width: 1280, height: 800 },
        trace: 'on-first-retry',
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.resolve(__dirname, 'dist/chrome-edge')}`,
            `--load-extension=${path.resolve(__dirname, 'dist/chrome-edge')}`,
            '--no-first-run',
            '--disable-gpu',
          ],
        },
      },
    },
  ],
});
