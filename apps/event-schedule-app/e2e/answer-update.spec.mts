import { expect, test } from '@playwright/test';
import {
  createAnswer,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
  firestoreWriteTimeout,
} from './answer-page-steps.mjs';

// An answer already in the table is opened again from its name, changed and
// saved, and then deleted. Firestore writes, so it runs against the emulators.

test(
  'an answer is updated from its name, and deleted',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const answerPage = await createEventAndOpenAnswerPage(page, context, {
      title: '回答の更新',
      numDates: 2,
    });

    // △ on both dates.
    await createAnswer(answerPage, 'Alice');

    const table = answerPage.getByTestId('answer-table');

    const scores = table.getByTestId('answer-table-row').getByTestId('score');

    // One answer, so each date's score is its icon's point over the full 10
    // points: △ (6 by default) is 0.6, and ○ (10) is 1.
    await expect.soft(scores).toHaveText(['0.6', '0.6']);

    const aliceHeader = table.getByRole('columnheader', {
      name: 'Alice',
      exact: true,
    });

    /* update: ○ on both dates */

    await aliceHeader.getByRole('button', { name: 'Alice' }).click();

    const section = answerPage.getByTestId('answer-being-edited-section');

    await expect.soft(section.getByTestId('username')).toHaveValue('Alice');

    await section.getByTestId('col-good-button').click();

    await section.getByTestId('submit-answer-button').click();

    await expect
      .soft(answerPage.getByTestId('add-answer-button'))
      .toBeVisible({ timeout: firestoreWriteTimeout });

    await expect
      .soft(scores)
      .toHaveText(['1', '1'], { timeout: firestoreWriteTimeout });

    /* delete */

    await aliceHeader.getByRole('button', { name: 'Alice' }).click();

    await section
      .getByTestId('buttons')
      .getByRole('button', { name: '削除する', exact: true })
      .click();

    await answerPage
      .getByRole('alertdialog')
      .getByRole('button', { name: '削除する', exact: true })
      .click();

    await expect
      .soft(aliceHeader)
      .toBeHidden({ timeout: firestoreWriteTimeout });
  },
);
