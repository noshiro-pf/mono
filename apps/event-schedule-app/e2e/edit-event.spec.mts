import { expect, test } from '@playwright/test';
import {
  answerPageLoadTimeout,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
  firestoreWriteTimeout,
  functionCallTimeout,
  submitAndOpenAnswerPage,
  toastWith,
} from './answer-page-steps.mjs';

// The edit page, reached from the answer page. It reads and writes the event,
// and checks the author's email through a function, so this runs against the
// emulators (`check:e2e:emulators`).

test(
  'an event without notifications is edited from its answer page',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const answerPage = await createEventAndOpenAnswerPage(page, context, {
      title: '編集前のイベント',
      numDates: 2,
    });

    const editButton = answerPage.getByTestId('edit-event-settings');

    await expect
      .soft(editButton)
      .toBeVisible({ timeout: answerPageLoadTimeout });

    await editButton.click();

    const editPage = answerPage.getByTestId('edit-event-schedule-page');

    // No email to confirm: the form opens at once.
    await expect
      .soft(editPage.getByText('イベント「編集前のイベント」の設定編集'))
      .toBeVisible({ timeout: answerPageLoadTimeout });

    // Without a deleted date, the update needs no confirmation.
    const submitButton = editPage
      .getByTestId('submit-button')
      .getByTestId('update-event-settings');

    // Nothing changed yet, so there is nothing to submit.
    await expect.soft(submitButton).toBeDisabled();

    await editPage.getByTestId('title').fill('編集後のイベント');

    await expect.soft(submitButton).toBeEnabled();

    /* deleting a date asks for confirmation before the update */

    const dateRows = editPage.getByTestId('selected-datetime-row');

    await expect.soft(dateRows).toHaveCount(2);

    await dateRows.last().getByTestId('delete-button').click();

    await expect.soft(dateRows).toHaveCount(1);

    await editPage
      .getByTestId('submit-button')
      .getByTestId('button-with-confirmation')
      .click();

    await answerPage
      .getByRole('alertdialog')
      .getByRole('button', { name: 'イベント設定を更新' })
      .click();

    await expect
      .soft(toastWith(answerPage, 'イベント設定を更新しました。'))
      .toBeVisible({ timeout: firestoreWriteTimeout });

    /* back on the answer page, which shows the edited event */

    await expect
      .soft(answerPage.getByTestId('answer-page').getByTestId('event-title'))
      .toHaveText('編集後のイベント', { timeout: answerPageLoadTimeout });

    await expect
      .soft(answerPage.getByTestId('answer-table-row'))
      .toHaveCount(1);

    /* an edit that deletes no date is submitted without confirmation */

    await editButton.click();

    await expect
      .soft(editPage.getByText('イベント「編集後のイベント」の設定編集'))
      .toBeVisible({ timeout: answerPageLoadTimeout });

    await editPage.getByTestId('note').fill('ノートを足した');

    await submitButton.click();

    await expect
      .soft(toastWith(answerPage, 'イベント設定を更新しました。'))
      .toBeVisible({ timeout: firestoreWriteTimeout });

    await expect
      .soft(answerPage.getByTestId('answer-page').getByText('ノートを足した'))
      .toBeVisible({ timeout: answerPageLoadTimeout });
  },
);

test(
  'an event with notifications asks for its email before it is edited',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const authorsEmail = 'author@example.com';

    await page.goto('/');

    {
      const createPage = page.getByTestId('create-page');

      await createPage.getByTestId('title').fill('通知ありのイベント');

      // Blueprint draws the switch's indicator over the input; both are in one
      // `<label>`, so the click the indicator takes still toggles the input.
      await createPage
        .getByRole('checkbox', { name: '幹事用通知設定' })
        // eslint-disable-next-line playwright/no-force-option -- the indicator is what takes the click, as a person's would
        .check({ force: true });

      await createPage.getByPlaceholder('sample@gmail.com').fill(authorsEmail);
    }

    const answerPage = await submitAndOpenAnswerPage(page, context);

    const editButton = answerPage.getByTestId('edit-event-settings');

    await expect
      .soft(editButton)
      .toBeVisible({ timeout: answerPageLoadTimeout });

    await editButton.click();

    const dialog = answerPage.getByRole('dialog');

    await expect
      .soft(
        dialog.getByText('通知用に設定したメールアドレスを入力してください。'),
      )
      .toBeVisible({ timeout: answerPageLoadTimeout });

    /* going back leaves the edit page */

    await dialog.getByRole('button', { name: '前のページに戻る' }).click();

    await expect.soft(editButton).toBeVisible();

    await editButton.click();

    /* a wrong address is refused, the registered one lets the form open */

    const emailInput = dialog.getByRole('textbox');

    const decideButton = dialog.getByRole('button', { name: '決定' });

    await emailInput.fill('someone-else@example.com');

    await decideButton.click();

    await expect
      .soft(dialog.getByText('登録されているメールアドレスと一致しません。'))
      .toBeVisible({ timeout: functionCallTimeout });

    await emailInput.fill(authorsEmail);

    await decideButton.click();

    await expect
      .soft(toastWith(answerPage, 'メールアドレスが確認できました。'))
      .toBeVisible({ timeout: functionCallTimeout });

    await expect.soft(dialog).toBeHidden();

    await expect
      .soft(
        answerPage
          .getByTestId('edit-event-schedule-page')
          .getByText('イベント「通知ありのイベント」の設定編集'),
      )
      .toBeVisible();

    /* leaving without changes needs no confirmation */

    await answerPage
      .getByRole('button', { name: '編集せずに回答ページに戻る' })
      .click();

    await expect.soft(editButton).toBeVisible();
  },
);
