import { expect, test } from '@playwright/test';

// What a pointer reaches on the pages shown signed out, reached from the
// keyboard: the create page's date picker, and the navbar's event-list item.
// They were `div`s and an `a` with no `href`, which the keyboard did not stop
// at. Nothing is written, so this needs no emulator.

/**
 * Wednesday 18 November 2026, at noon wherever the test runs: a day with days
 * after it in its month, which has five Mondays.
 */
const today = new Date(2026, 10, 18, 12);

test(
  'a day of the date picker is chosen and unchosen from the keyboard',
  { tag: '@regression' },
  async ({ page }) => {
    await page.clock.setFixedTime(today);

    await page.goto('/');

    const createPage = page.getByTestId('create-page');

    const picker = createPage.getByTestId('multiple-date-picker');

    const rows = createPage.getByTestId('selected-datetime-row');

    // The page starts with today selected.
    const todayButton = picker.getByRole('button', { pressed: true });

    await expect.soft(todayButton).toHaveText('18');

    await expect.soft(rows).toHaveCount(1);

    await todayButton.focus();

    await page.keyboard.press('Enter');

    await expect.soft(rows).toHaveCount(0);

    await expect
      .soft(picker.getByRole('button', { pressed: true }))
      .toHaveCount(0);

    // The focus stays on the day, so Tab moves to the next one.
    await page.keyboard.press('Tab');

    await page.keyboard.press('Space');

    await expect.soft(rows).toHaveCount(1);

    await expect
      .soft(picker.getByRole('button', { pressed: true }))
      .toHaveText('19');
  },
);

test(
  'a weekday of the date picker chooses its days of the month from the keyboard',
  { tag: '@regression' },
  async ({ page }) => {
    await page.clock.setFixedTime(today);

    await page.goto('/');

    const createPage = page.getByTestId('create-page');

    const picker = createPage.getByTestId('multiple-date-picker');

    const rows = createPage.getByTestId('selected-datetime-row');

    // Today, which the page starts with and is a Wednesday, goes first, so that
    // only the Mondays are chosen.
    await picker.getByRole('button', { pressed: true }).click();

    await expect.soft(rows).toHaveCount(0);

    await picker
      .getByRole('columnheader')
      .getByRole('button', { name: 'Mo', exact: true })
      .focus();

    await page.keyboard.press('Enter');

    await expect.soft(rows).toHaveCount(5);
  },
);

test(
  'the navbar’s event list opens its notice from the keyboard when signed out',
  { tag: '@regression' },
  async ({ page }) => {
    await page.goto('/');

    const eventList = page.getByTestId('nav-event-list');

    await expect.soft(eventList).toHaveRole('button');

    await eventList.focus();

    await page.keyboard.press('Enter');

    await expect
      .soft(
        page
          .getByRole('alertdialog')
          .getByText('この機能はログインユーザーのみ利用できます。'),
      )
      .toBeVisible();
  },
);
