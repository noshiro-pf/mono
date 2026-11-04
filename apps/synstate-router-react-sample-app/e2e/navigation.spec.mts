import { expect, test } from '@playwright/test';

// synstate-router-dom-sample-app runs this suite too, against the same pages
// built on synstate-dom: test only what both apps draw.

test('draws the home page', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect.soft(page.getByRole('heading', { level: 1 })).toHaveText('Home');

  await expect
    .soft(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Home' }),
    )
    .toHaveAttribute('aria-current', 'page');
});

test(
  'a link routes without reloading the page',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    // Set on the window: a full page load would lose it.
    await page.evaluate(() => {
      Reflect.set(globalThis, 'sameDocument', true);
    });

    await page.getByTestId('cheap-first').click();

    await expect.soft(page).toHaveURL('/products/?sort=price');

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Products');

    await expect
      .soft(page.getByTestId('product-list').getByRole('link').first())
      .toHaveText('Banana — ¥80');

    await expect
      .soft(
        page
          .getByRole('navigation', { name: 'Main' })
          .getByRole('link', { name: 'Products' }),
      )
      .toHaveAttribute('aria-current', 'page');

    expect
      .soft(await page.evaluate(() => Reflect.get(globalThis, 'sameDocument')))
      .toBe(true);
  },
);

test(
  'pages through the list, and back goes to the page before',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/');

    await expect.soft(page.getByTestId('page')).toHaveText('Page 1');

    await page.getByRole('link', { name: 'Next' }).click();

    await expect.soft(page).toHaveURL('/products/?page=2');

    await expect
      .soft(page.getByTestId('product-list').getByRole('link'))
      .toHaveText(['Durian — ¥2800', 'Elderberry — ¥600', 'Fig — ¥300']);

    await page.goBack();

    await expect.soft(page).toHaveURL('/products/');

    await expect.soft(page.getByTestId('page')).toHaveText('Page 1');
  },
);

test(
  'a page past the last links back to the last',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/?page=9');

    await expect.soft(page.getByText('No products.')).toBeVisible();

    await page.getByRole('link', { name: 'Previous' }).click();

    await expect.soft(page).toHaveURL('/products/?page=3');

    await expect
      .soft(page.getByTestId('product-list').getByRole('link'))
      .toHaveText(['Grape — ¥520']);
  },
);

test('the last product has no next', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/products/7/');

  await expect
    .soft(page.getByRole('heading', { level: 1 }))
    .toHaveText('Grape');

  await expect
    .soft(page.getByRole('link', { name: 'Next product' }))
    .toHaveCount(0);
});

test(
  'reads search values that do not decode as their defaults',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/?page=0&sort=size');

    await expect.soft(page.getByTestId('page')).toHaveText('Page 1');

    await expect
      .soft(page.getByTestId('product-list').getByRole('link').first())
      .toHaveText('Apple — ¥120');
  },
);

test(
  'typing a search rewrites the entry instead of adding one',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await page.goto('/products/?page=2');

    await page.getByTestId('search').fill('an');

    // Back to page 1, which is the default and so not written.
    await expect.soft(page).toHaveURL('/products/?q=an');

    await expect
      .soft(page.getByTestId('product-list').getByRole('link'))
      .toHaveText(['Banana — ¥80', 'Durian — ¥2800']);

    await page.goBack();

    await expect.soft(page).toHaveURL('/');
  },
);

test(
  'a path param that does not decode is not found',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/abc/');

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Not found');
  },
);

test(
  'an unknown product is the page’s to say',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/99/');

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('No product 99');
  },
);

test('an unknown path is not found', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/no-such-page/');

  await expect
    .soft(page.getByRole('heading', { level: 1 }))
    .toHaveText('Not found');
});

test(
  'redirects /settings/ to its first tab',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/settings/');

    await expect.soft(page).toHaveURL('/settings/profile/');

    await expect.soft(page.getByTestId('profile-tab')).toBeVisible();
  },
);

test(
  'the settings layout stays mounted between its tabs',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/settings/profile/');

    await page.getByTestId('settings-note').fill('kept');

    await page
      .getByRole('navigation', { name: 'Settings' })
      .getByRole('link', { name: 'Notifications' })
      .click();

    await expect.soft(page).toHaveURL('/settings/notifications/');

    await expect.soft(page.getByTestId('notifications-tab')).toBeVisible();

    await expect.soft(page.getByTestId('settings-note')).toHaveValue('kept');
  },
);

test(
  'a link with a fragment scrolls to its element',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Reviews of Cherry' }).click();

    await expect.soft(page).toHaveURL('/products/3/#reviews');

    await expect
      .soft(page.getByRole('heading', { name: 'Reviews' }))
      .toBeInViewport();
  },
);

test(
  'a reload leaves the position to the browser',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/3/#reviews');

    await expect
      .soft(page.getByRole('heading', { name: 'Reviews' }))
      .toBeInViewport();

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.reload();

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Cherry');

    // Two frames: the router's scroll, had it made one, is done by then.
    await page.evaluate(
      async () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        }),
    );

    // Whatever the browser restored, the router did not jump to the fragment.
    await expect
      .soft(page.getByRole('heading', { name: 'Reviews' }))
      .not.toBeInViewport();
  },
);

test(
  'a new page starts at the top, even on the same route',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/products/3/#reviews');

    await expect
      .soft(page.getByRole('heading', { name: 'Reviews' }))
      .toBeInViewport();

    // Below the reviews, so the page is scrolled down when it is clicked.
    await page.getByRole('link', { name: 'Next product' }).click();

    await expect.soft(page).toHaveURL('/products/4/');

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Durian');

    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
  },
);

test(
  'an external link is the browser’s',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/');

    await expect
      .soft(page.getByRole('link', { name: 'synstate-router on GitHub' }))
      .toHaveAttribute(
        'href',
        'https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router',
      );
  },
);
