import { expect, test } from '@playwright/test';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('root')).toBeVisible();
});

test(
  'the create page opens directly by its path',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/mono/algo-app/create/');

    await expect.soft(page.getByTestId('root')).toBeVisible();

    await expect.soft(page).toHaveURL(/\/mono\/algo-app\/create\/$/u);
  },
);
