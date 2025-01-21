import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect
    .soft(page.getByRole('button', { name: '日程調整ページを作成' }))
    .toBeVisible();

  // イベント名
  await expect.soft(page.getByTestId('title')).toBeVisible();

  // ノート
  await expect.soft(page.getByTestId('note')).toBeVisible();

  await expect
    .soft(page.getByTestId('datetime-list').getByTestId('add-button'))
    .toBeVisible();
});
