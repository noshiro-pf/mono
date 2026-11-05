import { expect, test } from '@playwright/test';
import {
  createAnswer,
  emulatorTestTimeout,
  firestoreWriteTimeout,
} from './answer-page-steps.mjs';

// Writes to Firestore, so it runs against the emulators, through
// `check:e2e:emulators`, and `check:e2e` leaves it out by this tag.

test('create event', { tag: '@emulators' }, async ({ page, context }) => {
  test.setTimeout(emulatorTestTimeout);

  await page.goto('/');

  {
    const createPage = page.getByTestId('create-page');

    /* create an event */

    await createPage.getByTestId('title').fill('ボドゲ会（仮）');

    await createPage.getByTestId('note').fill('ノート（仮）');

    const addButton = createPage
      .getByTestId('datetime-list')
      .getByTestId('add-button');

    await addButton.click();

    await addButton.click();

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
    .toBeVisible({ timeout: firestoreWriteTimeout });

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
      .getByRole('spinbutton');

    await fairPointInput.clear();

    await fairPointInput.fill('7.5');

    await fairPointInput.blur();
  }

  await expect.soft(editPageSubmitButton).toBeEnabled();

  await editPageSubmitButton.click();

  await expect.soft(answerPage.getByTestId('answer-page')).toBeVisible();

  const text = answerPage.getByTestId('icon-description-row--fair');

  await expect.soft(text).toHaveText('（7.5点）');
});
