import { expect, test } from '@playwright/test';

// An address no route matches shows the not-found page, whose one link goes
// back to the create page. Reads nothing, so it runs without the emulators.

test(
  'an unknown address shows the not-found page',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/no-such-page/');

    await expect
      .soft(page.getByText('ページが見つかりませんでした。'))
      .toBeVisible();

    await page.getByRole('link', { name: 'トップページ' }).click();

    await expect.soft(page.getByTestId('create-page')).toBeVisible();

    await expect.soft(page).toHaveURL(/\/create\/$/u);
  },
);
