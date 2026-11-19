import { expect, test } from '@playwright/test';

test.describe('Read-only entries with Edit (e2e)', () => {
  // What: entries open read-only; Edit reveals fields; Save returns to read-only.
  // Params: seeded newest entry; rename the title and save.
  // Expected: no textboxes on load, Edit shows Title/Entry, after Save the new heading shows read-only.
  test('opens read-only, edits, and saves back to read-only', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('02-readonly-with-edit-button.png') });

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Entry')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('03-edit-mode.png') });

    const title = `Edited ${Date.now()}`;
    await page.getByLabel('Title').fill(title);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('04-saved-readonly.png') });
  });

  // What: Cancel discards edits.
  // Params: Edit, change title, Cancel with dialog accepted.
  // Expected: original heading shown, read-only.
  test('cancel discards changes', async ({ page }, testInfo) => {
    await page.goto('/');
    const original = await page.getByRole('heading', { level: 1 }).first().innerText();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Title').fill('Throwaway title');
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: original })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('05-cancel-readonly.png') });
  });

  // What: New entry starts editable and returns to read-only after Create.
  // Params: click New entry, fill title, Create.
  // Expected: textboxes visible first, then heading with title and no textboxes.
  test('new entry starts in edit mode then read-only', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: /New entry/ }).first().click();
    await expect(page.getByLabel('Title')).toBeVisible();
    const title = `Fresh ${Date.now()}`;
    await page.getByLabel('Title').fill(title);
    await page.getByRole('button', { name: 'Create entry' }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('06-created-readonly.png') });
  });

  // What: selecting another entry while editing opens it read-only.
  // Params: Edit the first entry, click the second sidebar item.
  // Expected: no textboxes, no Save button, second entry heading shown.
  test('switching entry while editing opens read-only', async ({ page }, testInfo) => {
    await page.goto('/');
    const items = page.getByRole('list', { name: 'Journal entries' }).getByRole('button');
    await expect(items.nth(1)).toBeVisible();
    const other = await items.nth(1).locator('.entry-title').innerText();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByLabel('Title')).toBeVisible();
    await items.nth(1).click();
    await expect(page.getByRole('heading', { level: 1, name: other })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('07-switch-readonly.png') });
  });

  // What: Delete works directly from read-only view.
  // Params: create an entry, then Delete and confirm without clicking Edit.
  // Expected: entry removed from the sidebar.
  test('deletes from read-only view', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: /New entry/ }).first().click();
    const title = `Doomed ${Date.now()}`;
    await page.getByLabel('Title').fill(title);
    await page.getByRole('button', { name: 'Create entry' }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
    await expect(page.getByRole('list', { name: 'Journal entries' }).getByText(title)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('08-deleted-from-readonly.png') });
  });
});
