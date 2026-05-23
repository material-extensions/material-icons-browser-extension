import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  projects: [
    {
      name: 'chromium',
      use: {
        viewport: { width: 1280, height: 800 },
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
