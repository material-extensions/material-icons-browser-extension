import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve(__dirname, '..', 'dist', 'chrome-edge');

test.describe('GitHub icon replacement', () => {
  let context: BrowserContext;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--disable-gpu',
      ],
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should replace file icons on a GitHub repository page', async () => {
    const page = await context.newPage();
    await page.goto(
      'https://github.com/material-extensions/material-icons-browser-extension',
      { waitUntil: 'networkidle' }
    );

    // Wait for at least one icon to be replaced
    await page
      .locator('[data-material-icons-extension="icon"]')
      .first()
      .waitFor({ state: 'attached', timeout: 15000 });

    // Check that multiple icons have been replaced
    const replacedIcons = await page
      .locator('[data-material-icons-extension="icon"]')
      .count();
    expect(replacedIcons).toBeGreaterThan(5);

    // Verify specific known files have correct icons
    await expect(
      page.locator('[data-material-icons-extension-filename="tsconfig.json"]').first()
    ).toBeAttached();

    await expect(
      page.locator('[data-material-icons-extension-filename="package.json"]').first()
    ).toBeAttached();

    await page.close();
  });

  test('should replace folder icons with material icons', async () => {
    const page = await context.newPage();
    await page.goto(
      'https://github.com/material-extensions/material-icons-browser-extension',
      { waitUntil: 'networkidle' }
    );

    await page
      .locator('[data-material-icons-extension="icon"]')
      .first()
      .waitFor({ state: 'attached', timeout: 15000 });

    // Check that the src folder has a material icon with background-image
    const srcIcon = page.locator(
      '[data-material-icons-extension-filename="src"]'
    ).first();
    await expect(srcIcon).toBeAttached();

    const bgImage = await srcIcon.evaluate(
      (el) => (el as HTMLElement).style.backgroundImage
    );
    expect(bgImage).toContain('folder-src');

    await page.close();
  });

  test('should apply background-image on SVG (not insert img elements)', async () => {
    const page = await context.newPage();
    await page.goto(
      'https://github.com/material-extensions/material-icons-browser-extension',
      { waitUntil: 'networkidle' }
    );

    await page
      .locator('[data-material-icons-extension="icon"]')
      .first()
      .waitFor({ state: 'attached', timeout: 15000 });

    // Ensure no <img> elements from the extension exist in the tree view
    const treeImgs = await page
      .locator('img[data-material-icons-extension="icon"]')
      .count();
    expect(treeImgs).toBe(0);

    // Ensure SVGs have background-image set
    const bgImage = await page
      .locator('svg[data-material-icons-extension="icon"]')
      .first()
      .evaluate((el) => (el as HTMLElement).style.backgroundImage);
    expect(bgImage).toContain('url(');

    await page.close();
  });

  test('should show open folder icon when expanding a folder', async () => {
    const page = await context.newPage();
    await page.goto(
      'https://github.com/material-extensions/material-icons-browser-extension',
      { waitUntil: 'networkidle' }
    );

    await page
      .locator('[data-material-icons-extension="icon"]')
      .first()
      .waitFor({ state: 'attached', timeout: 15000 });

    // Find any collapsed folder and click to expand it
    const collapsedFolder = page.locator(
      '[role="treeitem"][aria-expanded="false"]'
    ).first();

    if ((await collapsedFolder.count()) > 0) {
      await collapsedFolder.click();
      // Wait for the open icon to appear
      await page.waitForTimeout(2000);

      // Look for any open folder icon
      const openIcons = page.locator(
        '[data-material-icons-extension-iconname*="-open.svg"]'
      );
      const count = await openIcons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }

    await page.close();
  });
});
