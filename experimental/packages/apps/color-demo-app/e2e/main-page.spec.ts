import { expect, test } from '@playwright/test';

test('visit main page', async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('title')).toHaveText('Color demo');
});
