import { type BrowserContext, expect, type Page, test } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
import {
  answerPageLoadTimeout,
  createAnswer,
  emulatorTestTimeout,
  firestoreWriteTimeout,
} from './answer-page-steps.mjs';

// The "全員回答済みの候補日のみ表示" filter of the answer page: the checkbox, the
// tag it adds, and the `filled-date-only` query parameter that keeps it across
// a reload. The event and its answers are Firestore writes, so this runs
// against the emulators (`check:e2e:emulators`), like `create-event.spec.mts`.

const filledDateOnlyLabel = '全員回答済みの候補日のみ表示';

const numDates = 3;

test(
  'filled-date-only filter',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const answerPage = await createEventAndOpenAnswerPage(page, context);

    // Alice answers every date, Bob only the first one, so the first date is
    // the only one everybody has answered.
    await createAnswer(answerPage, 'Alice');

    await createAnswer(answerPage, 'Bob', 'first-only');

    const rows = answerPage
      .getByTestId('answer-table')
      .getByTestId('answer-table-row');

    await expect.soft(rows).toHaveCount(numDates);

    const firstDateRow = (await rows.first().textContent()) ?? '';

    const filterTag = answerPage
      .getByTestId('filter-tags')
      .getByTestId('filled-date-only-tag');

    await answerPage.getByTestId('toggle-detailed-filter').click();

    const filledDateOnlyFilter = answerPage.getByTestId(
      'filled-date-only-filter',
    );

    const checkbox = filledDateOnlyFilter.getByRole('checkbox');

    // The input itself is transparent and covered by the box drawn over it, so
    // the click goes to the label, as a person's would.
    const clickCheckbox = (): Promise<void> =>
      filledDateOnlyFilter.getByText(filledDateOnlyLabel).click();

    await expect.soft(checkbox).not.toBeChecked();

    /* the checkbox turns the filter on and off */

    await clickCheckbox();

    await expect.soft(checkbox).toBeChecked();

    await expect.soft(rows).toHaveText([firstDateRow]);

    await expect.soft(filterTag).toBeVisible();

    await expect
      .soft(answerPage)
      .toHaveURL(/[?&]filled-date-only=true(?:&|$)/u);

    await clickCheckbox();

    await expect.soft(checkbox).not.toBeChecked();

    await expect.soft(rows).toHaveCount(numDates);

    await expect.soft(filterTag).toBeHidden();

    await expect.soft(answerPage).not.toHaveURL(/filled-date-only/u);

    /* removing the tag turns the filter off */

    await clickCheckbox();

    await expect.soft(rows).toHaveText([firstDateRow]);

    await filterTag.getByRole('button', { name: 'Remove tag' }).click();

    await expect.soft(checkbox).not.toBeChecked();

    await expect.soft(rows).toHaveCount(numDates);

    await expect.soft(answerPage).not.toHaveURL(/filled-date-only/u);

    /* the query parameter restores the filter after a reload */

    await clickCheckbox();

    await expect
      .soft(answerPage)
      .toHaveURL(/[?&]filled-date-only=true(?:&|$)/u);

    await answerPage.reload();

    await expect
      .soft(rows)
      .toHaveText([firstDateRow], { timeout: answerPageLoadTimeout });

    await expect.soft(filterTag).toBeVisible();

    await answerPage.getByTestId('toggle-detailed-filter').click();

    await expect.soft(checkbox).toBeChecked();

    await clickCheckbox();

    await expect.soft(rows).toHaveCount(numDates);

    await expect.soft(answerPage).not.toHaveURL(/filled-date-only/u);
  },
);

/** Creates an event with `numDates` candidate dates and opens its answer page. */
const createEventAndOpenAnswerPage = async (
  page: DeepReadonly<Page>,
  context: DeepReadonly<BrowserContext>,
): Promise<Page> => {
  await page.goto('/');

  const createPage = page.getByTestId('create-page');

  await createPage.getByTestId('title').fill('全員回答済みフィルター');

  // The page starts with today selected; deselect it, so that the dates are
  // exactly the three picked below, whichever day the test runs on. `nth`
  // counts the days of this month only, so these are the 11th to the 13th.
  await createPage.getByRole('gridcell', { selected: true }).click();

  const daysOfThisMonth = createPage.getByRole('gridcell', {
    disabled: false,
  });

  await daysOfThisMonth.nth(10).click();

  await daysOfThisMonth.nth(11).click();

  await daysOfThisMonth.nth(12).click();

  await expect
    .soft(createPage.getByTestId('selected-datetime-row'))
    .toHaveCount(numDates);

  await createPage.getByTestId('create-button').click();

  await expect
    .soft(
      page
        .getByTestId('create-event-result-dialog-body')
        .getByTestId('url-wrapper'),
    )
    .toBeVisible({ timeout: firestoreWriteTimeout });

  const pagePromise = context.waitForEvent('page');

  await page
    .getByTestId('create-event-result-dialog-footer')
    .getByTestId('open-answer-page-button')
    .click();

  return pagePromise;
};
