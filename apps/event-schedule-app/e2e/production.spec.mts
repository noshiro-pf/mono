import { expect, type Locator, type Page, test } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// Run daily against https://event-schedule-app.web.app by
// `.github/workflows/e2e-production.yml`, through `check:e2e:production`;
// `check:e2e` leaves these out by their tag.
//
// They write to the production Firestore, and leave it as they found it:
//
// - **No event is created.** The rules let nothing delete one, so each run
//   would leave one behind for good. The tests use one event made by hand
//   instead (the README says how), whose id is the secret
//   `EVENT_SCHEDULE_APP_E2E_EVENT_ID`.
// - **An answer is added and then deleted**, and a run starts by deleting
//   whatever answer an earlier, failed run left.
// - **The notes are changed and then set to `fixtureNotes`**, whatever they
//   were before; a run that failed in between is put right by the next.
//
// The event is anonymous, so its id is all it takes to edit it, which is why
// the id is a secret and the config keeps no trace. Its notifications are off,
// so the answers sent here mail no one.
//
// Imports nothing from the workspace at run time (a type is erased): the daily
// job builds nothing (see `configs/playwright.production.config.mts`).

/** What the event's notes are set back to at the end of every run. */
const fixtureNotes =
  '本番環境のe2eテスト（.github/workflows/e2e-production.yml）が毎日読み書きするイベントです。';

/**
 * Every answer these tests add is named with this prefix, which is how a run
 * finds what an earlier one failed to delete.
 */
const answerNamePrefix = 'e2e-';

/** The answer page fetches the event and its answers before it is usable. */
const answerPageLoadTimeout = 30_000;

/**
 * More leftovers than this means something other than failed runs is adding
 * them, and deleting them one by one would only use up the test's timeout.
 */
const maxLeftoverAnswers = 10;

test.describe('the fixture event', () => {
  test('shows the answer page', { tag: '@production' }, async ({ page }) => {
    await gotoAnswerPage(page);

    for (const iconName of ['good', 'fair', 'poor'] as const) {
      // eslint-disable-next-line no-await-in-loop
      await expect
        .soft(page.getByTestId(`icon-description-row--${iconName}`))
        .toBeVisible();
    }

    await expect.soft(page.getByTestId('refresh-answers')).toBeEnabled();

    await expect
      .soft(page.getByRole('button', { name: '回答を追加する' }))
      .toBeVisible();
  });

  test(
    'adds an answer and deletes it',
    { tag: '@production' },
    async ({ page }) => {
      await gotoAnswerPage(page);

      await deleteLeftoverAnswers(page);

      const username = `${answerNamePrefix}${Date.now().toString()}`;

      await addAnswer(page, username);

      await expect.soft(answerNameButton(page, username)).toBeVisible();

      await deleteAnswer(page, username);

      // Read back from Firestore rather than from what the page still holds.
      await gotoAnswerPage(page);

      await expect
        .soft(answerNameButton(page, leftoverAnswerName))
        .toHaveCount(0);
    },
  );

  test(
    'edits the notes and puts them back',
    { tag: '@production' },
    async ({ page }) => {
      // One word: the answer page shows the notes split at whitespace.
      const marker = `notes-${Date.now().toString()}`;

      await updateNotes(page, marker);

      await expect.soft(page.getByText(marker)).toBeVisible();

      await updateNotes(page, fixtureNotes);

      // Read back from Firestore rather than from what the page still holds.
      await gotoAnswerPage(page);

      await expect.soft(page.getByText(marker)).toHaveCount(0);

      await expect.soft(page.getByText(fixtureNotes)).toBeVisible();
    },
  );
});

/**
 * Throws rather than skipping when the secret is missing, so that a run without
 * it fails instead of passing having tested only the top page.
 */
const fixtureEventPath = (suffix: '' | 'edit/'): string => {
  const eventId = process.env['EVENT_SCHEDULE_APP_E2E_EVENT_ID'];

  if (eventId === undefined || eventId === '') {
    throw new Error(
      'EVENT_SCHEDULE_APP_E2E_EVENT_ID is not set; see "End-to-end tests" in apps/event-schedule-app/README.md.',
    );
  }

  return `/event/${eventId}/${suffix}`;
};

const gotoAnswerPage = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.goto(fixtureEventPath(''));

  // Shown once both the event and its answers have arrived.
  await expect.soft(page.getByTestId('edit-event-settings')).toBeVisible({
    timeout: answerPageLoadTimeout,
  });
};

const leftoverAnswerName = new RegExp(`^${answerNamePrefix}`, 'u');

/** The button that opens an answer for editing, in the answer table. */
const answerNameButton = (
  page: DeepReadonly<Page>,
  answerName: string | Readonly<RegExp>,
): Locator => page.getByRole('button', { name: answerName, exact: true });

const deleteAnswer = async (
  page: DeepReadonly<Page>,
  username: string,
): Promise<void> => {
  await answerNameButton(page, username).click();

  const buttons = page
    .getByTestId('answer-being-edited-section')
    .getByTestId('buttons');

  await buttons.getByRole('button', { name: '削除する' }).click();

  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: '削除する' })
    .click();

  await expect.soft(buttons).toBeHidden();

  await expect.soft(answerNameButton(page, username)).toHaveCount(0);
};

const deleteLeftoverAnswers = async (
  page: DeepReadonly<Page>,
  budget: number = maxLeftoverAnswers,
): Promise<void> => {
  const [answerName] = await answerNameButton(
    page,
    leftoverAnswerName,
  ).allTextContents();

  if (answerName === undefined) {
    return;
  }

  if (budget <= 0) {
    throw new Error(
      `More than ${maxLeftoverAnswers.toString()} answers named "${answerNamePrefix}…" are on the fixture event.`,
    );
  }

  await deleteAnswer(page, answerName);

  await deleteLeftoverAnswers(page, budget - 1);
};

const addAnswer = async (
  page: DeepReadonly<Page>,
  username: string,
): Promise<void> => {
  await page.getByTestId('add-answer-button').click();

  const section = page.getByTestId('answer-being-edited-section');

  await section.getByTestId('username').fill(username);

  // Every date answered, so the submit button needs no confirmation.
  await section.getByTestId('col-fair-button').click();

  await section
    .getByTestId('buttons')
    .getByTestId('submit-answer-button')
    .click();

  await expect.soft(section.getByTestId('buttons')).toBeHidden();
};

/** Ends on the answer page, which the app returns to after saving. */
const updateNotes = async (
  page: DeepReadonly<Page>,
  notes: string,
): Promise<void> => {
  await page.goto(fixtureEventPath('edit/'));

  const editPage = page.getByTestId('edit-event-schedule-page');

  const note = editPage.getByTestId('note');

  await expect.soft(note).toBeVisible({ timeout: answerPageLoadTimeout });

  await note.fill(notes);

  const submitButton = editPage
    .getByTestId('submit-button')
    .getByTestId('update-event-settings');

  await expect.soft(submitButton).toBeEnabled();

  await submitButton.click();

  await expect.soft(page.getByTestId('edit-event-settings')).toBeVisible({
    timeout: answerPageLoadTimeout,
  });
};
