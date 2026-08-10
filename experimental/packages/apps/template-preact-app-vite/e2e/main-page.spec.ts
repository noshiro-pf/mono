import { expect, test } from '@playwright/test';

const incrementButtonId = 'increment-button';

test('visit main page', async ({ page }) => {
  await page.goto('/');

  const incrementButton = page.getByTestId(incrementButtonId);

  await expect.soft(incrementButton).toBeVisible();
});

test('increment', async ({ page }) => {
  await page.goto('/');

  const incrementButton = page.getByTestId(incrementButtonId);

  await incrementButton.click();

  await expect.soft(incrementButton).toHaveText('count is 1');
});
