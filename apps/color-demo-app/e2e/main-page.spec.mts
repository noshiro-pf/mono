import { expect, test } from '@playwright/test';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('title')).toHaveText('Color demo');
});
