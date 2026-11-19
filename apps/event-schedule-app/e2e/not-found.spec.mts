import { expect, test, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
import {
  answerPageLoadTimeout,
  emulatorTestTimeout,
} from './answer-page-steps.mjs';

// An address no route matches shows the not-found page under the navbar; its
// one link goes back to the create page. The first two tests read nothing, so
// they run without the emulators; the last reads Firestore.

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

// Not `@smoke`, which the daily production run takes: it would test the
// deployed build, published by hand and behind this check.
test(
  'the not-found page has the navbar, and its icon below it',
  { tag: '@regression' },
  async ({ page }) => {
    const mut_rows: Readonly<{
      width: number;
      navbars: number;
      gap: number;
    }>[] = [];

    for (const width of [390, 1280]) {
      // eslint-disable-next-line no-await-in-loop -- one width after another
      await page.setViewportSize({ width, height: 800 });

      // eslint-disable-next-line no-await-in-loop -- one width after another
      await page.goto('/no-such-page/');

      // eslint-disable-next-line no-await-in-loop -- one width after another
      await expect
        .soft(page.getByText('ページが見つかりませんでした。'))
        .toBeVisible();

      mut_rows.push({
        width,
        // eslint-disable-next-line no-await-in-loop -- one width after another
        navbars: await page.getByTestId('nav-sign-in').count(),
        // eslint-disable-next-line no-await-in-loop -- one width after another
        gap: await iconGapBelowNavbar(page),
      });
    }

    expect
      .soft(mut_rows.filter(({ navbars, gap }) => navbars !== 1 || gap < 20))
      .toStrictEqual([]);
  },
);

// The answer and edit pages show the same page for an event that is not there,
// in place of their own header: one navbar, not two. Reads Firestore, so it
// runs against the emulators.
test(
  'an event that does not exist shows the not-found page, with one navbar',
  { tag: '@emulators' },
  async ({ page }) => {
    // Two waits of `answerPageLoadTimeout`, one a page, can run past the
    // default 30s on a slow run.
    test.setTimeout(emulatorTestTimeout);

    const mut_rows: Readonly<{
      path: string;
      navbars: number;
      gap: number;
    }>[] = [];

    for (const path of [
      '/event/no-such-event/',
      '/event/no-such-event/edit/',
    ]) {
      // eslint-disable-next-line no-await-in-loop -- one page after another
      await page.goto(path);

      // The answer page's allowance, sized for the event and its answers,
      // serves the edit page too: either shows this as soon as the event's read
      // finds nothing.
      // eslint-disable-next-line no-await-in-loop -- one page after another
      await expect
        .soft(page.getByText('ページが見つかりませんでした。'))
        .toBeVisible({ timeout: answerPageLoadTimeout });

      mut_rows.push({
        path,
        // eslint-disable-next-line no-await-in-loop -- one page after another
        navbars: await page.getByTestId('nav-sign-in').count(),
        // eslint-disable-next-line no-await-in-loop -- one page after another
        gap: await iconGapBelowNavbar(page),
      });
    }

    expect
      .soft(mut_rows.filter(({ navbars, gap }) => navbars !== 1 || gap < 20))
      .toStrictEqual([]);
  },
);

/**
 * How far below the navbar's bottom edge the not-found page's icon starts:
 * negative infinity where there is not exactly one navbar and one message with
 * an icon in it, or one of them is not rendered, so that a missing, doubled or
 * unrendered one is reported rather than waited for.
 */
const iconGapBelowNavbar = async (
  page: DeepReadonly<Page>,
): Promise<number> => {
  // The sign-in link fills the navbar's last row from top to bottom.
  const signIn = page.getByTestId('nav-sign-in');

  const message = page.getByTestId('not-found-message');

  // The first of the message's icons; the link back has its own.
  // eslint-disable-next-line playwright/no-raw-locators -- Blueprint's icon has no role or text to find it by, and it is the icon whose place is measured
  const icon = message.locator('svg').first();

  // Counted first: `boundingBox` waits for an element that is not there. The
  // not-found page, once shown, stays, so what was counted is still there to
  // measure.
  if (
    (await signIn.count()) !== 1 ||
    (await message.count()) !== 1 ||
    (await icon.count()) !== 1
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const navbarBox = await signIn.boundingBox();

  const iconBox = await icon.boundingBox();

  return navbarBox === null || iconBox === null
    ? Number.NEGATIVE_INFINITY
    : iconBox.y - (navbarBox.y + navbarBox.height);
};
