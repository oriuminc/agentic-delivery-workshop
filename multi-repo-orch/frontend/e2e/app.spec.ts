import { expect, test } from '@playwright/test';

test.describe('Folio app (e2e)', () => {
  // What: Opens the real app in Chrome against the real backend and a throw-away DB.
  // Params: no setup; the backend seeds its own data on first start.
  // Expected: the page loads with no error toast, proving frontend, proxy and API are wired together.
  test('loads the app and reaches the backend without an error', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /new/i }).first()).toBeVisible();
    await expect(page.getByText(/Ref [0-9a-f-]+/)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('01-app-loaded-no-error.png') });
  });
});
