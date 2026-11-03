import {
  type BrowserContext,
  expect,
  type Locator,
  type Page,
} from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// Steps and timeouts shared by the specs that run against the emulators.

/**
 * A Firestore write (creating an event, saving an answer) takes longer than the
 * default 5s allows.
 */
export const firestoreWriteTimeout = 20_000;

/** A call to Auth (registering, signing in, a password reset request). */
export const authCallTimeout = 20_000;

/** A call to a Cloud Function that reads (the event list, the email check). */
export const functionCallTimeout = 20_000;

/** The answer page fetches the event and its answers before it can be used. */
export const answerPageLoadTimeout = 15_000;

/**
 * For `test.setTimeout`: a spec that makes several Firestore writes, each with
 * its own allowance above, runs past Playwright's default 30s on a slow run.
 */
export const emulatorTestTimeout = 120_000;

/**
 * Adds an answer that marks every date with △ (`'all'`), or only the first date
 * with ○ and leaves the rest blank (`'first-only'`, for an event with two or
 * more dates: with one, nothing is left blank and no confirmation is asked).
 */
export const createAnswer = async (
  answerPage: DeepReadonly<Page>,
  username: string,
  dates: 'all' | 'first-only' = 'all',
): Promise<void> => {
  // create answer
  const addAnswerButton = answerPage.getByTestId('add-answer-button');

  await expect.soft(addAnswerButton).toBeVisible({
    timeout: answerPageLoadTimeout,
  });

  await addAnswerButton.click();

  const answerBeingEditedSection = answerPage.getByTestId(
    'answer-being-edited-section',
  );

  await expect.soft(answerBeingEditedSection).toBeVisible();

  const buttons = answerBeingEditedSection.getByTestId('buttons');

  await expect.soft(buttons).toBeVisible();

  const buttonWithConfirmation = buttons.getByTestId(
    'button-with-confirmation',
  );

  await expect.soft(buttonWithConfirmation).toBeVisible();

  // submit button should be disabled if username is not filled
  await expect.soft(buttonWithConfirmation).toBeDisabled();

  await answerBeingEditedSection.getByTestId('username').fill(username);

  // submit button should be enabled if username is filled
  await expect.soft(buttonWithConfirmation).toBeEnabled();

  if (dates === 'all') {
    await answerBeingEditedSection.getByTestId('col-fair-button').click();

    const submitAnswerButton = buttons.getByTestId('submit-answer-button');

    await expect.soft(submitAnswerButton).toBeVisible();

    await expect.soft(submitAnswerButton).toBeEnabled();

    await submitAnswerButton.click();
  } else {
    await answerBeingEditedSection
      .getByTestId('answer-being-edited-row')
      .first()
      .getByTestId('good-button')
      .click();

    // With dates left unanswered, the submit button asks for confirmation.
    await buttonWithConfirmation.click();

    await answerPage
      .getByRole('alertdialog')
      .getByRole('button', { name: '回答を追加する' })
      .click();
  }

  // The section closes once the write has finished, whether it succeeded or
  // not; the column in the answer table is what says it did. (`refresh-answers`
  // says neither: it is disabled only for the 1s throttle after a read, so
  // asserting it raced the write.)
  await expect
    .soft(addAnswerButton)
    .toBeVisible({ timeout: firestoreWriteTimeout });

  await expect
    .soft(
      answerPage
        .getByTestId('answer-table')
        .getByRole('columnheader', { name: username, exact: true }),
    )
    .toBeVisible({ timeout: answerPageLoadTimeout });
};

/**
 * Creates an event named `title` with `numDates` candidate dates (three at
 * most), and opens its answer page.
 */
export const createEventAndOpenAnswerPage = async (
  page: DeepReadonly<Page>,
  context: DeepReadonly<BrowserContext>,
  { title, numDates }: Readonly<{ title: string; numDates: 1 | 2 | 3 }>,
): Promise<Page> => {
  await page.goto('/');

  const createPage = page.getByTestId('create-page');

  await createPage.getByTestId('title').fill(title);

  // The page starts with today selected; deselect it, so that the dates are
  // exactly the ones picked below, whichever day the test runs on. `nth` counts
  // the days of this month only, so these are the 11th to the 13th.
  await createPage.getByRole('gridcell', { selected: true }).click();

  const daysOfThisMonth = createPage.getByRole('gridcell', {
    disabled: false,
  });

  for (const nth of [10, 11, 12].slice(0, numDates)) {
    // eslint-disable-next-line no-await-in-loop -- one day after another
    await daysOfThisMonth.nth(nth).click();
  }

  await expect
    .soft(createPage.getByTestId('selected-datetime-row'))
    .toHaveCount(numDates);

  return submitAndOpenAnswerPage(page, context);
};

/**
 * Submits the create page as it is filled in, and opens the answer page of the
 * event it creates, from the result dialog.
 */
export const submitAndOpenAnswerPage = async (
  page: DeepReadonly<Page>,
  context: DeepReadonly<BrowserContext>,
): Promise<Page> => {
  await page.getByTestId('create-page').getByTestId('create-button').click();

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

/** The toast that says `message`. */
export const toastWith = (page: DeepReadonly<Page>, message: string): Locator =>
  page.getByRole('alert').filter({ hasText: message });
