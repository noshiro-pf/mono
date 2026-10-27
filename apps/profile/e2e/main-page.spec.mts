import { expect, test } from '@playwright/test';

test('visit main page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByTestId('root')).toBeVisible();
});

test('tab 1', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByTestId('tabs');

  await tabs.getByTestId('tab-0').click();

  const heading = page.getByTestId('root').getByRole('heading');

  await expect.soft(heading.nth(0)).toHaveText('Links');

  await expect.soft(heading.nth(1)).toHaveText('略歴');
});

test('tab 2', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByTestId('tabs');

  await tabs.getByTestId('tab-1').click();

  const heading = page.getByTestId('root').getByRole('heading');

  await expect.soft(heading.nth(0)).toHaveText('自己紹介');
});

test('tab 3', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByTestId('tabs');

  await tabs.getByTestId('tab-2').click();

  const heading = page.getByTestId('root').getByRole('heading');

  await expect.soft(heading.nth(0)).toHaveText('スキル');
});

test('tab 4', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByTestId('tabs');

  await tabs.getByTestId('tab-3').click();

  const heading = page.getByTestId('root').getByRole('heading');

  await expect.soft(heading.nth(0)).toHaveText('制作物');
});

test('tab 5', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByTestId('tabs');

  await tabs.getByTestId('tab-4').click();

  const heading = page.getByTestId('root').getByRole('heading');

  await expect.soft(heading.nth(0)).toHaveText('執筆物');
});

test('the root opens the first tab', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page).toHaveURL(/\/mono\/profile\/career\/$/u);
});

test(
  'a tab is a path below the base path, and survives a reload',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('tabs').getByTestId('tab-2').click();

    await expect.soft(page).toHaveURL(/\/mono\/profile\/skills\/$/u);

    await page.reload();

    await expect
      .soft(page.getByTestId('root').getByRole('heading').nth(0))
      .toHaveText('スキル');
  },
);

test(
  'a tab opens directly by its path',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/mono/profile/writings/');

    await expect
      .soft(page.getByTestId('root').getByRole('heading').nth(0))
      .toHaveText('執筆物');
  },
);
