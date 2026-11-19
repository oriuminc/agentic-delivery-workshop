import { expect, test } from '@playwright/test';

test.describe('Navy blue theme (e2e)', () => {
  // What: Checks the primary theme token and the primary button colour in real Chrome (light scheme).
  // Params: colorScheme light; no data setup.
  // Expected: --accent is navy (#0b1f4b) and the primary button background renders as rgb(11, 31, 75).
  test('primary token and primary button are navy', async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const btn = page.locator('.btn-primary').first();
    await expect(btn).toBeVisible();
    const token = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase());
    expect(token).toBe('#0b1f4b');
    await expect(btn).toHaveCSS('background-color', 'rgb(11, 31, 75)');
    await page.screenshot({ path: testInfo.outputPath('02-navy-theme.png') });
  });
});
