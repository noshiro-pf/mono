import { expect, test } from '@playwright/test';
import { leftOf } from './boxes.mjs';

// On a wide screen a page keeps its content to the page's width, centred, and
// its title moves with that content, keeping the place it has on a narrow
// screen: the create page's title stays in line with its first input. Reads
// nothing, so it runs without the emulators. Not `@smoke`, which the daily
// production run takes: it would test the deployed build, published by hand and
// behind this check.

test(
  "the create page's title moves with its content on a wide screen",
  { tag: '@regression' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });

    await page.goto('/');

    const title = page.getByTestId('page-title');

    const input = page.getByTestId('create-page').getByTestId('title');

    await expect.soft(input).toBeVisible();

    const narrowTitleLeft = await leftOf(title);

    const narrowOffset = (await leftOf(input)) - narrowTitleLeft;

    await page.setViewportSize({ width: 2560, height: 900 });

    // Centred: the content is 1220px at most, so its left edge is half of the
    // rest of the page's width (the window's, less a scroll bar) further in.
    // Both are read in each poll, the page's width as well as the title, since
    // the layout may still be settling after the resize.
    await expect
      .poll(
        async () =>
          (await leftOf(title)) -
          (await page.evaluate(
            () => (document.documentElement.clientWidth - 1220) / 2,
          )),
      )
      .toBeCloseTo(narrowTitleLeft, 0);

    expect
      .soft((await leftOf(input)) - (await leftOf(title)))
      .toBeCloseTo(narrowOffset, 0);

    // The navbar still spans the screen.
    expect
      .soft(await leftOf(page.getByText('日程調整を作成', { exact: true })))
      .toBeLessThan(100);
  },
);
