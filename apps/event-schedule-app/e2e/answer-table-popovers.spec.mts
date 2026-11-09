import { expect, test } from '@playwright/test';
import {
  createAnswer,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
} from './answer-page-steps.mjs';

// The popovers of the answer table, an answer's comment and the sort menu of a
// column. Each button opens its popover itself, inside the popover's target,
// which once took the same click for a second one and closed it at once. The
// answer is a Firestore write, so this runs against the emulators.

const comment = '午後なら参加できます';

test(
  "the answer table's popovers open, and close as asked",
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const answerPage = await createEventAndOpenAnswerPage(page, context, {
      title: 'コメントと並べ替え',
      numDates: 3,
    });

    await createAnswer(answerPage, 'Alice', 'all', comment);

    const table = answerPage.getByTestId('answer-table');

    /* an answer's comment */

    const commentButton = table
      .getByTestId('comment-button')
      .getByRole('button');

    await commentButton.click();

    // Still open once the click is over; the content alone would still be drawn
    // as it fades out.
    await expect.soft(commentButton).toHaveAttribute('aria-expanded', 'true');

    const commentPopover = answerPage.getByTestId('comment-popover');

    await expect
      .soft(commentPopover)
      .toMatchAriaSnapshot(
        [`- text: ${comment}`, '- button "閉じる"'].join('\n'),
      );

    await commentPopover.getByRole('button', { name: '閉じる' }).click();

    await expect.soft(commentButton).toHaveAttribute('aria-expanded', 'false');

    await expect.soft(commentPopover).toBeHidden();

    /* the sort menu of the dates */

    const rows = table.getByTestId('answer-table-row');

    await expect.soft(rows).toHaveCount(3);

    const lastDate = (await rows.last().textContent()) ?? '';

    const sortButton = table
      .getByTestId('sort-button')
      .first()
      .getByRole('button');

    await sortButton.click();

    await expect.soft(sortButton).toHaveAttribute('aria-expanded', 'true');

    const sortMenu = answerPage.getByTestId('sort-menu');

    await expect
      .soft(sortMenu)
      .toMatchAriaSnapshot(
        ['- button "昇順ソート"', '- button "降順ソート"'].join('\n'),
      );

    await sortMenu.getByRole('button', { name: '降順ソート' }).click();

    await expect.soft(sortMenu).toBeHidden();

    await expect.soft(rows.first()).toHaveText(lastDate);
  },
);
