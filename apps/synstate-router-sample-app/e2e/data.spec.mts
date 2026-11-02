import { expect, test, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// These tests hold the page's clock, so that what is drawn while a request is
// in flight can be read. Running it this long lets any request of the fake
// server answer.
const untilAnswered = 1000;

const holdClock = async (page: DeepReadonly<Page>): Promise<void> => {
  // 2026-01-01T00:00:00Z; any time will do.
  const start = 1_767_225_600_000;

  await page.clock.install({ time: start });

  // Paused before the page loads: the requests it makes at once wait for
  // `runFor`.
  await page.clock.pauseAt(start + 1);
};

test(
  'a product page opened from its URL fetches its product',
  { tag: '@smoke' },
  async ({ page }) => {
    await holdClock(page);

    await page.goto('/products/3/');

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Loading…');

    await page.clock.runFor(untilAnswered);

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Cherry');
  },
);

test(
  'the next page of the list is fetched when it is opened',
  { tag: '@smoke' },
  async ({ page }) => {
    await holdClock(page);

    await page.goto('/products/');

    await page.clock.runFor(untilAnswered);

    await page.getByRole('link', { name: 'Next' }).click();

    await expect.soft(page.getByTestId('page')).toHaveText('Page 2');

    await expect
      .soft(page.getByTestId('products'))
      .toHaveAttribute('aria-busy', 'true');

    await expect.soft(page.getByTestId('loading')).toBeVisible();

    await page.clock.runFor(untilAnswered);

    await expect
      .soft(page.getByTestId('product-list').getByRole('link'))
      .toHaveText(['Durian — ¥2800', 'Elderberry — ¥600', 'Fig — ¥300']);
  },
);

test(
  'leaving a product before it arrives aborts its request',
  { tag: '@smoke' },
  async ({ page }) => {
    const mut_log: string[] = [];

    page.on('console', (message) => {
      mut_log.push(message.text());
    });

    await holdClock(page);

    await page.goto('/products/');

    await page.clock.runFor(untilAnswered);

    await page.getByRole('link', { name: 'Apple — ¥120' }).click();

    await expect
      .soft(page.getByRole('heading', { level: 1 }))
      .toHaveText('Loading…');

    await page.goBack();

    await page.clock.runFor(untilAnswered);

    await expect
      .soft(page.getByTestId('product-list').getByRole('link').first())
      .toHaveText('Apple — ¥120');

    await expect
      .poll(() =>
        mut_log.filter((line) => line.startsWith('GET /api/products/1:')),
      )
      .toStrictEqual([
        'GET /api/products/1: sent',
        'GET /api/products/1: aborted',
      ]);
  },
);
