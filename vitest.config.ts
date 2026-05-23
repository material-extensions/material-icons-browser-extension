import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';

// icon-list.json is generated at build time and gitignored.
// Create an empty stub if it doesn't exist so Vite can resolve the import
// (tests mock this module via vi.mock).
const iconListPath = path.resolve(__dirname, 'src/icon-list.json');
if (!fs.existsSync(iconListPath)) {
  fs.writeFileSync(iconListPath, '{}');
}

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
