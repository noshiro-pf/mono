import { range } from '@noshiro/mono-utils';
import { expect, type Page, test } from '@playwright/test';

test('create event', async ({ page, context }) => {
  await page.goto('/');

  {
    const createPage = page.getByTestId('create-page');

    /* create an event */

    await createPage.getByTestId('title').fill('ボドゲ会（仮）');
    await createPage.getByTestId('note').fill('ノート（仮）');

    for (const _ of range(0, 2)) {
      // eslint-disable-next-line no-await-in-loop
      await createPage
        .getByTestId('datetime-list')
        .getByTestId('add-button')
        .click();
    }

    await createPage.getByTestId('create-button').click();
  }

  // create-event-result-dialog

  const createEventResultDialogBody = page.getByTestId(
    'create-event-result-dialog-body',
  );

  const createEventResultDialogFooter = page.getByTestId(
    'create-event-result-dialog-footer',
  );

  await expect.soft(createEventResultDialogBody).toBeVisible();

  await expect
    .soft(createEventResultDialogBody.getByTestId('url-wrapper'))
    .toBeVisible({ timeout: 20_000 });

  {
    const backButton = createEventResultDialogFooter.getByTestId('back-button');

    await expect.soft(backButton).toBeVisible();
    await expect.soft(backButton).toBeDisabled();

    const clipboardButton =
      createEventResultDialogBody.getByTestId('clipboard-button');

    await expect.soft(clipboardButton).toBeVisible();

    await clipboardButton.click();

    await expect.soft(backButton).toBeEnabled();
  }

  const pagePromise = context.waitForEvent('page');

  await createEventResultDialogFooter
    .getByTestId('open-answer-page-button')
    .click();

  const answerPage = await pagePromise;

  {
    /* add answers */

    await expect.soft(answerPage.getByTestId('answer-page')).toBeVisible();

    // add answers
    await createAnswer(answerPage, 'Alice');

    await createAnswer(answerPage, 'Bob');

    /* edit event */

    await answerPage.getByTestId('edit-event-settings').click();

    await expect
      .soft(answerPage.getByTestId('diff-ul').getByRole('listitem'))
      .toHaveCount(0);
  }

  {
    const editEventSchedulePage = answerPage.getByTestId(
      'edit-event-schedule-page',
    );

    // イベント設定を更新
    const editPageSubmitButton = editEventSchedulePage
      .getByTestId('submit-button')
      .getByTestId('update-event-settings');

    const editPageSubmitButtonWithConfirm = editEventSchedulePage
      .getByTestId('submit-button')
      .getByTestId('update-event-settings-with-confirm');

    await expect.soft(editPageSubmitButtonWithConfirm).toBeHidden();
    await expect.soft(editPageSubmitButton).toBeVisible();

    // 未編集のときは更新ボタンは disabled
    await expect.soft(editPageSubmitButton).toBeDisabled();

    const title = editEventSchedulePage.getByTestId('title');

    await expect.soft(title).toHaveValue('ボドゲ会（仮）');
    await title.fill('ボドゲ会');
    await expect.soft(title).toHaveValue('ボドゲ会');

    const note = editEventSchedulePage.getByTestId('note');

    await expect.soft(note).toHaveValue('ノート（仮）\n');
    await note.fill('ノート\n');
    await expect.soft(note).toHaveValue('ノート\n');

    await expect.soft(editPageSubmitButtonWithConfirm).toBeHidden();

    await expect.soft(editPageSubmitButton).toBeVisible();
    await expect.soft(editPageSubmitButton).toBeEnabled();

    {
      const fairPointInput = editEventSchedulePage
        .getByTestId('icon-settings')
        .getByTestId('fair-point-input')
        .getByRole('textbox');

      await fairPointInput.clear();
      await fairPointInput.fill('7.5');
      await fairPointInput.blur();
    }

    await expect.soft(editPageSubmitButton).toBeEnabled();

    await editPageSubmitButton.click();

    await expect.soft(answerPage.getByTestId('answer-page')).toBeVisible();

    const text = answerPage.getByTestId('icon-description-row--fair');
    await expect.soft(text).toHaveText('（7.5点）');
  }
});

const createAnswer = async (
  answerPage: DeepReadonly<Page>,
  username: string,
): Promise<void> => {
  // create answer
  await answerPage.getByTestId('add-answer-button').click({ timeout: 15_000 });

  const answerBeingEditedSection = answerPage.getByTestId(
    'answer-being-edited-section',
  );

  await expect.soft(answerBeingEditedSection).toBeVisible();

  const buttons = answerBeingEditedSection.getByTestId('buttons');

  await expect.soft(buttons).toBeVisible();

  {
    const buttonWithConfirmation = buttons.getByTestId(
      'button-with-confirmation',
    );

    await expect.soft(buttonWithConfirmation).toBeVisible();

    // submit button should be disabled if username is not filled
    await expect.soft(buttonWithConfirmation).toBeDisabled();

    await answerBeingEditedSection.getByTestId('username').fill(username);

    // submit button should be enabled if username is filled
    await expect.soft(buttonWithConfirmation).toBeEnabled();
  }

  // fill all datetime
  await answerBeingEditedSection.getByTestId('col-fair-button').click();

  {
    const submitAnswerButton = buttons.getByTestId('submit-answer-button');

    await expect.soft(submitAnswerButton).toBeVisible();

    await expect.soft(submitAnswerButton).toBeEnabled();

    await submitAnswerButton.click();
  }

  await expect.soft(answerPage.getByTestId('refresh-answers')).toBeDisabled();
};
