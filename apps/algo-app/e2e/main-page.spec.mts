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

test(
  'the create button waits for a name',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/mono/algo-app/create/');

    const createButton = page.getByRole('button', { name: '部屋を作成' });

    await expect.soft(createButton).toBeDisabled();

    await page.getByPlaceholder('algo master').fill('alice');

    await expect.soft(createButton).toBeEnabled();

    await page.getByPlaceholder('algo master').fill('');

    await expect.soft(createButton).toBeDisabled();
  },
);

test(
  'the rooms page without a room offers the way back',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/mono/algo-app/rooms/');

    await page.getByRole('button', { name: 'メインページに戻る' }).click();

    await expect.soft(page.getByPlaceholder('algo master')).toBeVisible();
  },
);
