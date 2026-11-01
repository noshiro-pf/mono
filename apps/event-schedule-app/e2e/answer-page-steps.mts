import { expect, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// Steps and timeouts shared by the specs that run against the emulators.

/**
 * A Firestore write (creating an event, saving an answer) takes longer than the
 * default 5s allows.
 */
export const firestoreWriteTimeout = 20_000;

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
