import { expect, test } from '@playwright/test';

test.describe('Entry user metadata (e2e)', () => {
  // What: Creates an entry in real Chrome, then reopens it from the sidebar.
  // Params: title "Meta create <ts>"; reopen via another seeded entry first.
  // Expected: "Created from" shows a non-empty IP and this browser's user agent.
  test('shows created-from ip and browser user agent when reopening a new entry', async ({ page }, testInfo) => {
    const title = `Meta create ${Date.now()}`;
    await page.goto('/');
    await page.getByRole('button', { name: /new/i }).first().click();
    await page.getByLabel('Title').fill(title);
    await page.getByRole('button', { name: 'Create entry' }).click();
    await expect(page.getByText('Saved just now')).toBeVisible();
    await page.getByRole('button', { name: /Welcome to Folio/ }).click();
    await page.getByRole('button', { name: new RegExp(title) }).click();
    const ua = await page.evaluate(() => navigator.userAgent);
    const line = page.getByText(/^Created from /);
    await expect(line).toBeVisible();
    await expect(line).toContainText(ua);
    await expect(line).not.toHaveText(/^Created from (unknown)?\s*·/);
    await page.screenshot({ path: testInfo.outputPath('01-created-from-shown-on-reopen.png') });
  });

  // What: Edits an entry and saves it.
  // Params: create entry, append text to the body, Save.
  // Expected: "Last edited from" is present and "Created from" text is unchanged.
  test('shows last-edited-from after saving and keeps created-from unchanged', async ({ page }, testInfo) => {
    const title = `Meta edit ${Date.now()}`;
    await page.goto('/');
    await page.getByRole('button', { name: /new/i }).first().click();
    await page.getByLabel('Title').fill(title);
    await page.getByRole('button', { name: 'Create entry' }).click();
    await expect(page.getByText('Saved just now')).toBeVisible();
    const created = await page.getByText(/^Created from /).textContent();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Entry').fill('edited body');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved just now')).toBeVisible();
    await expect(page.getByText(/^Last edited from /)).toBeVisible();
    await expect(page.getByText(/^Created from /)).toHaveText(created!);
    await page.screenshot({ path: testInfo.outputPath('02-last-edited-from-after-save.png') });
  });

  // What: Opens a seeded legacy entry that has no meta.
  // Params: the seeded "Welcome to Folio" entry.
  // Expected: it opens, no meta block and no error toast.
  test('opens a legacy entry without a meta block or error', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Welcome to Folio/ }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to Folio' })).toBeVisible();
    await expect(page.getByText(/Created from|Last edited from/)).toHaveCount(0);
    await expect(page.getByText(/Ref [0-9a-f-]+/)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('03-legacy-entry-no-meta.png') });
  });
});
