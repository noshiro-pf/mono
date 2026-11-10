import { expect, test } from '@playwright/test';
// The list the build writes pages from, imported directly as the Vite config
// does: the rule allows a barrel only one directory down, and this module
// imports nothing, so the test runner loads no library for it.
// eslint-disable-next-line import-x/no-internal-modules
import { routePaths } from '../src/constants/route-paths.mjs';

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
  "a tab's path without its trailing slash gains it",
  { tag: '@smoke' },
  async ({ page }) => {
    // The router's canonical URL, on the dev server. On the Pages site the
    // server's own directory redirect gets there first.
    await page.goto('/mono/profile/products');

    await expect.soft(page).toHaveURL(/\/mono\/profile\/products\/$/u);

    await expect
      .soft(page.getByTestId('root').getByRole('heading').nth(0))
      .toHaveText('制作物');
  },
);

test(
  'the tabs are as many as the paths the build writes pages at',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expect
      .soft(page.getByTestId('tabs').getByRole('tab'))
      .toHaveCount(routePaths.length);
  },
);

for (const [index, path] of routePaths.entries()) {
  test(
    `the path ${path} the build writes a page at opens tab ${index + 1}`,
    { tag: '@smoke' },
    async ({ page }) => {
      // A path the router does not know would be redirected to the first tab.
      await page.goto(`/mono/profile${path}`);

      await expect
        .soft(page.getByTestId('tabs').getByTestId(`tab-${index}`))
        .toHaveAttribute('aria-selected', 'true');

      await expect
        .soft(page)
        .toHaveURL((url) => url.pathname === `/mono/profile${path}`);
    },
  );
}

test(
  'switching tabs shows the new tab from its top',
  { tag: '@smoke' },
  async ({ page }) => {
    // From a short tab to a longer one, so that the browser has no reason to
    // move the scroll by itself.
    await page.goto('/mono/profile/skills/');

    await page.mouse.wheel(0, 300);

    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);

    await page.getByTestId('tabs').getByTestId('tab-1').click();

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
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

    // A screen reader announces each frame by its title, so each says which
    // video it is, rather than the player's default.
    await expect.soft(videos.nth(0)).toHaveAttribute('title', /\S/u);

    await expect.soft(videos.nth(1)).toHaveAttribute('title', /\S/u);

    await expect
      .soft(videos.nth(0))
      .not.toHaveAttribute('title', 'YouTube video player');

    await expect
      .soft(videos.nth(1))
      .not.toHaveAttribute('title', 'YouTube video player');

    const firstTitle = await videos.nth(0).getAttribute('title');

    await expect
      .soft(videos.nth(1))
      .not.toHaveAttribute('title', firstTitle ?? '');
  },
);

test(
  'the product cards show their screenshots, each named',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/mono/profile/products/');

    const root = page.getByTestId('root');

    const images = root.getByRole('img');

    await expect.soft(images.first()).toBeVisible();

    expect.soft(await images.count()).toBeGreaterThanOrEqual(10);

    // A screenshot is named by its product's title. An image with no name, such
    // as an icon left exposed, or one named by its bundled asset URL is not.
    await expect
      .soft(
        root.getByRole('img', {
          name: /^$|^(?:\/|data:|https?:)|\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/iu,
        }),
      )
      .toHaveCount(0);
  },
);

test(
  'the header links to the accounts',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    const banner = page.getByRole('banner');

    await expect.soft(banner.getByRole('link')).toHaveCount(2);

    // The links are named by `aria-label`, so their icons are drawing only, and
    // the cat image is decoration.
    await expect.soft(banner.getByRole('img')).toHaveCount(0);

    await expect
      .soft(banner.getByRole('link', { name: 'Twitter' }))
      .toHaveAttribute('href', 'https://twitter.com/noshiro_piko');

    await expect
      .soft(banner.getByRole('link', { name: 'GitHub' }))
      .toHaveAttribute('href', 'https://github.com/noshiro-pf');
  },
);
