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

test(
  'the selected tab is the one marked selected',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const tabs = page.getByTestId('tabs');

    await expect
      .soft(tabs.getByTestId('tab-0'))
      .toHaveAttribute('aria-selected', 'true');

    await tabs.getByTestId('tab-3').click();

    await expect
      .soft(tabs.getByTestId('tab-3'))
      .toHaveAttribute('aria-selected', 'true');

    await expect
      .soft(tabs.getByTestId('tab-0'))
      .toHaveAttribute('aria-selected', 'false');
  },
);

test(
  'the browser history moves between tabs',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('tabs').getByTestId('tab-4').click();

    await expect
      .soft(page.getByTestId('root').getByRole('heading').nth(0))
      .toHaveText('執筆物');

    await page.goBack();

    await expect.soft(page).toHaveURL(/\/mono\/profile\/career\/$/u);

    await expect
      .soft(page.getByTestId('root').getByRole('heading').nth(0))
      .toHaveText('Links');
  },
);

test(
  'clicking the selected tab adds no history entry',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const writingsTab = page.getByTestId('tabs').getByTestId('tab-4');

    await writingsTab.click();

    await expect.soft(writingsTab).toHaveAttribute('aria-selected', 'true');

    await writingsTab.click();

    await page.goBack();

    await expect.soft(page).toHaveURL(/\/mono\/profile\/career\/$/u);

    await expect
      .soft(page.getByTestId('root').getByRole('heading').nth(0))
      .toHaveText('Links');
  },
);

test(
  'a path that names no tab opens the first one',
  { tag: '@smoke' },
  async ({ page }) => {
    // The router's redirect, which the dev server reaches for any path. The
    // Pages site has pages at the tabs' paths only.
    await page.goto('/mono/profile/no-such-tab/');

    await expect.soft(page).toHaveURL(/\/mono\/profile\/career\/$/u);
  },
);

test(
  'the self-introduction embeds the videos with their attributes',
  { tag: '@smoke' },
  async ({ page }) => {
    // The page is checked, not YouTube.
    await page.route(/youtube\.com/u, async (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '' }),
    );

    await page.goto('/mono/profile/biography/');

    const videos = page.getByTestId('root').getByTestId('video');

    await expect.soft(videos).toHaveCount(2);

    await expect.soft(videos.nth(0)).toHaveAttribute('allowfullscreen');

    await expect.soft(videos.nth(0)).toHaveAttribute('frameborder', '0');

    await expect.soft(videos.nth(0)).toHaveAttribute('width', '560');
  },
);

test(
  'the product cards show their screenshots',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/mono/profile/products/');

    const images = page.getByTestId('root').getByRole('img');

    await expect.soft(images.first()).toBeVisible();

    expect.soft(await images.count()).toBeGreaterThanOrEqual(10);
  },
);

test(
  'the header links to the accounts',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const banner = page.getByRole('banner');

    await expect.soft(banner.getByRole('link')).toHaveCount(2);

    await expect
      .soft(banner.getByRole('link', { name: 'Twitter' }))
      .toHaveAttribute('href', 'https://twitter.com/noshiro_piko');

    await expect
      .soft(banner.getByRole('link', { name: 'GitHub' }))
      .toHaveAttribute('href', 'https://github.com/noshiro-pf');
  },
);
