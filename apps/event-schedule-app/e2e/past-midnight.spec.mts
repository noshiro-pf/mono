import { expect, test } from '@playwright/test';

// A create page left open past midnight: the dates it offers count from the day
// the user is working, not the day the page loaded. The browser's locale and
// time zone are fixed, since the row shows its date in the locale's format and
// midnight is the zone's.
test.use({ locale: 'en-US', timezoneId: 'Asia/Tokyo' });

test(
  'the deadline shortcuts and a new date row count from the new day',
  // Not `@smoke`, which the daily production run takes: it would test the
  // deployed build, published by hand and behind this check. No run selects
  // `@regression`; the plain run takes it as it takes every test that is
  // neither `@emulators` nor `@production`.
  { tag: '@regression' },
  async ({ page }) => {
    await page.clock.install({ time: '2026-11-03T23:50:00+09:00' });

    await page.goto('/');

    const createPage = page.getByTestId('create-page');

    await createPage
      .getByRole('checkbox', { name: '回答期限', exact: true })
      // eslint-disable-next-line playwright/no-force-option -- Blueprint's indicator is what takes the click, as a person's would
      .check({ force: true });

    await page.clock.setSystemTime('2026-11-04T00:10:00+09:00');

    const deadlineInput = createPage.getByPlaceholder('YYYY-MM-DD HH:mm');

    await deadlineInput.click();

    await page.getByRole('menuitem', { name: 'Today' }).click();

    await expect.soft(deadlineInput).toHaveValue('2026-11-04  23:59');

    await createPage
      .getByTestId('datetime-list')
      .getByTestId('add-button')
      .click();

    await expect
      .soft(
        createPage
          .getByTestId('selected-datetime-row')
          .last()
          .getByRole('combobox', { name: 'yyyy-mm-dd' }),
      )
      .toHaveValue('11/4/2026');
  },
);
