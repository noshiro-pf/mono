import { expect, test } from '@playwright/test';
import {
  openEmailVerificationLink,
  register,
  signIn,
  signOut,
  uniqueEmail,
  username,
} from './account-steps.mjs';
import {
  answerPageLoadTimeout,
  authCallTimeout,
  createEventAndOpenAnswerPage,
  emulatorTestTimeout,
  firestoreWriteTimeout,
  functionCallTimeout,
  submitAndOpenAnswerPage,
  toastWith,
} from './answer-page-steps.mjs';

// The edit page, reached from the answer page. It reads and writes the event,
// checks the author's email through a function, and an event with notifications
// needs a signed-in account whose email is verified, so this runs against the
// emulators (`check:e2e:emulators`), Auth's included.

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

    // Nothing changed yet, so there is nothing to submit, and the diff box says
    // so rather than standing empty.
    await expect.soft(submitButton).toBeDisabled();

    const diffBox = editPage.getByTestId('event-schedule-diff');

    const noChanges = diffBox.getByText('変更はありません。');

    await expect.soft(noChanges).toBeVisible();

    await editPage.getByTestId('title').fill('編集後のイベント');

    await expect.soft(submitButton).toBeEnabled();

    await expect.soft(noChanges).toBeHidden();

    await expect
      .soft(diffBox.getByTestId('diff-ul').getByText('イベント名：'))
      .toBeVisible();

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

    // The update went through, so nothing says it was cancelled (#3414).
    // Counted once, now: `toHaveCount(0)` would retry until such a toast timed
    // out, and pass.
    /* eslint-disable playwright/prefer-to-have-count -- one count, not a retry */
    const cancelToasts = await answerPage
      .getByText('編集をキャンセルしました。')
      .count();

    expect.soft(cancelToasts).toBe(0);
    /* eslint-enable playwright/prefer-to-have-count */

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
  'an event with notifications is edited by its signed-in author alone',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    const authorsEmail = uniqueEmail();

    /* signed out, notifications cannot be turned on */

    await page.goto('/');

    const notificationSwitch = page
      .getByTestId('create-page')
      .getByRole('checkbox', { name: '幹事用通知設定' });

    await expect.soft(notificationSwitch).toBeDisabled();

    /* signed in with a verified email, they go to that email */

    await register(page, authorsEmail);

    await openEmailVerificationLink(page, authorsEmail);

    await signOut(page);

    await signIn(page, authorsEmail);

    await page.goto('/');

    {
      const createPage = page.getByTestId('create-page');

      await createPage.getByTestId('title').fill('通知ありのイベント');

      // Blueprint draws the switch's indicator over the input; both are in one
      // `<label>`, so the click the indicator takes still toggles the input.
      await notificationSwitch
        // eslint-disable-next-line playwright/no-force-option -- the indicator is what takes the click, as a person's would
        .check({ force: true });

      await expect
        .soft(createPage.getByRole('textbox', { name: '通知先メールアドレス' }))
        .toHaveValue(authorsEmail);
    }

    const answerPage = await submitAndOpenAnswerPage(page, context);

    // The new tab signs in again from the kept session a moment after it loads;
    // the email dialog fills in the account's email only from then.
    await expect
      .soft(answerPage.getByTestId('nav-user-menu'))
      .toHaveText(username, { timeout: authCallTimeout });

    const editButton = answerPage.getByTestId('edit-event-settings');

    await expect
      .soft(editButton)
      .toBeVisible({ timeout: answerPageLoadTimeout });

    /* the signed-in author's own email is filled in and confirmed */

    await editButton.click();

    await expect
      .soft(toastWith(answerPage, 'メールアドレスが確認できました。'))
      .toBeVisible({ timeout: functionCallTimeout });

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

    /* signed out, even the author's email does not open the form */

    const answerUrl = answerPage.url();

    await signOut(answerPage);

    await answerPage.goto(answerUrl);

    await answerPage.getByTestId('edit-event-settings').click();

    const dialog = answerPage.getByRole('dialog');

    await dialog.getByRole('textbox').fill(authorsEmail);

    await dialog.getByRole('button', { name: '決定' }).click();

    await expect
      .soft(
        toastWith(
          answerPage,
          'このイベントは、作成したアカウントでログインしているときだけ編集できます。',
        ),
      )
      .toBeVisible({ timeout: functionCallTimeout });

    await expect.soft(dialog).toBeVisible();
  },
);
