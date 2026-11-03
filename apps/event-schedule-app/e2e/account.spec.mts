import { expect, type Locator, type Page, test } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
import {
  answerPageLoadTimeout,
  authCallTimeout,
  emulatorTestTimeout,
  firestoreWriteTimeout,
  functionCallTimeout,
  submitAndOpenAnswerPage,
  toastWith,
} from './answer-page-steps.mjs';

// Registering, signing out and in, the list of one's own events, asking for a
// new password, and the account settings in the user menu. Every step goes to
// Auth, Firestore or a function, so this runs against the emulators
// (`check:e2e:emulators`), Auth's included.

const password = 'e2e-password';

const username = 'e2e-user';

test(
  'an account is registered, signed in to, and lists its events',
  { tag: '@emulators' },
  async ({ page, context }) => {
    test.setTimeout(emulatorTestTimeout);

    /* signed out, the list sends one to sign in first */

    await page.goto('/');

    await page.getByTestId('nav-event-list').click();

    const forNonLoggedInUser = page.getByRole('alertdialog');

    await expect
      .soft(
        forNonLoggedInUser.getByText(
          'この機能はログインユーザーのみ利用できます。',
        ),
      )
      .toBeVisible();

    await forNonLoggedInUser
      .getByRole('button', { name: 'ログインページへ移動' })
      .click();

    await expect.soft(page.getByTestId('sign-in-page')).toBeVisible();

    /* register */

    const email = uniqueEmail();

    await register(page, email);

    const userMenu = page.getByTestId('nav-user-menu');

    /* sign out, and in again */

    await signOut(page);

    const signInPage = page.getByTestId('sign-in-page');

    await signInPage.getByTestId('email').fill(email);

    await signInPage.getByTestId('password').fill('not-the-password');

    await signInPage.getByTestId('sign-in-button').click();

    await expect
      .soft(signInPage.getByText('パスワードが間違っています。'))
      .toBeVisible({ timeout: authCallTimeout });

    await signInPage.getByTestId('password').fill(password);

    await signInPage.getByTestId('sign-in-button').click();

    await expect
      .soft(toastWith(page, 'ログインしました。'))
      .toBeVisible({ timeout: authCallTimeout });

    await expect.soft(userMenu).toHaveText(username);

    /* an event made and answered while signed in is on the list */

    await page
      .getByTestId('create-page')
      .getByTestId('title')
      .fill('一覧に載るイベント');

    // `fetchEventListOfUser` lists only the events one has answered, leaving
    // out one only created, so this one is answered before the list is opened.
    const answerPage = await submitAndOpenAnswerPage(page, context);

    // A new tab: Auth restores the user there before the answer form can fill
    // in the name.
    await expect
      .soft(answerPage.getByTestId('nav-user-menu'))
      .toHaveText(username, { timeout: authCallTimeout });

    // Signed in, the name is filled in from the account.
    const addAnswerButton = answerPage.getByTestId('add-answer-button');

    await expect
      .soft(addAnswerButton)
      .toBeVisible({ timeout: answerPageLoadTimeout });

    await addAnswerButton.click();

    const answerBeingEditedSection = answerPage.getByTestId(
      'answer-being-edited-section',
    );

    await expect
      .soft(answerBeingEditedSection.getByTestId('username'))
      .toHaveValue(username);

    await answerBeingEditedSection.getByTestId('col-good-button').click();

    await answerBeingEditedSection
      .getByTestId('buttons')
      .getByTestId('submit-answer-button')
      .click();

    await expect
      .soft(
        answerPage
          .getByTestId('answer-table')
          .getByRole('columnheader', { name: username, exact: true }),
      )
      .toBeVisible({ timeout: firestoreWriteTimeout });

    await answerPage.close();

    await page.goto('/event-list/');

    const listPage = page.getByTestId('event-list-page');

    const items = listPage.getByTestId('event-list-item');

    await expect
      .soft(items.filter({ hasText: '一覧に載るイベント' }))
      .toBeVisible({ timeout: functionCallTimeout });

    const count = listPage.getByTestId('event-count');

    /* the search narrows the list to the events whose title has the words */

    await listPage.getByTestId('search-input').fill('ない言葉');

    await listPage.getByTestId('search-button').click();

    await expect
      .soft(count)
      .toHaveText('0件', { timeout: functionCallTimeout });

    await expect.soft(items).toHaveCount(0);

    await listPage.getByTestId('search-input').fill('一覧に載る');

    await listPage.getByTestId('search-button').click();

    await expect
      .soft(count)
      .toHaveText('1件', { timeout: functionCallTimeout });

    await expect.soft(items).toHaveText(/「一覧に載るイベント」/u);

    /* a new password is asked for, signed out */

    await signOut(page);

    await signInPage.getByTestId('password-reset-link').click();

    await signInPage.getByTestId('email').fill(email);

    await signInPage.getByTestId('reset-password-button').click();

    await expect
      .soft(toastWith(page, 'パスワードリセットメールを送信しました。'))
      .toBeVisible({ timeout: authCallTimeout });
  },
);

test(
  'the account settings change the name, password and email, and delete the account',
  { tag: '@emulators' },
  async ({ page }) => {
    test.setTimeout(emulatorTestTimeout);

    const email = uniqueEmail();

    await register(page, email);

    const userMenu = page.getByTestId('nav-user-menu');

    /* the name */

    {
      const dialog = await openAccountSetting(page, 'ユーザー名を変更');

      await dialog.getByTestId('new-display-name').fill('e2e-user-renamed');

      await dialog.getByRole('button', { name: '更新する' }).click();

      await expect
        .soft(toastWith(page, 'ユーザー名を更新しました。'))
        .toBeVisible({ timeout: authCallTimeout });

      await expect.soft(userMenu).toHaveText('e2e-user-renamed');
    }

    /* the password, which the email change below asks for */

    const newPassword = 'e2e-new-password';

    {
      const dialog = await openAccountSetting(page, 'パスワードを変更');

      await dialog.getByTestId('old-password').fill(password);

      await dialog.getByTestId('new-password').fill(newPassword);

      await dialog.getByTestId('verify-new-password').fill(newPassword);

      await dialog.getByRole('button', { name: '更新する' }).click();

      await expect
        .soft(toastWith(page, 'パスワードを更新しました。'))
        .toBeVisible({ timeout: authCallTimeout });
    }

    /* the email */

    const newEmail = uniqueEmail();

    {
      const dialog = await openAccountSetting(page, 'メールアドレスを変更');

      await expect.soft(dialog.getByText(email)).toBeVisible();

      await dialog.getByTestId('new-email').fill(newEmail);

      await dialog.getByTestId('password').fill(newPassword);

      await dialog.getByRole('button', { name: '更新する' }).click();

      await expect
        .soft(toastWith(page, 'メールアドレスを更新しました。'))
        .toBeVisible({ timeout: authCallTimeout });
    }

    /* signing in again takes the new email and password */

    await signOut(page);

    const signInPage = page.getByTestId('sign-in-page');

    await signInPage.getByTestId('email').fill(newEmail);

    await signInPage.getByTestId('password').fill(newPassword);

    await signInPage.getByTestId('sign-in-button').click();

    await expect
      .soft(toastWith(page, 'ログインしました。'))
      .toBeVisible({ timeout: authCallTimeout });

    /* deleting the account asks for the email and password once more */

    {
      const dialog = await openAccountSetting(page, 'アカウントを削除');

      await dialog.getByTestId('verify-email').fill(newEmail);

      await dialog.getByTestId('password').fill(newPassword);

      await dialog
        .getByRole('button', { name: 'アカウントを削除する' })
        .click();

      await expect
        .soft(toastWith(page, 'アカウントを削除しました。'))
        .toBeVisible({ timeout: authCallTimeout });
    }

    await expect.soft(page.getByTestId('nav-sign-in')).toBeVisible();
  },
);

/**
 * Unique per call, so that a retry, or a second run against the same emulators,
 * can register again.
 */
const uniqueEmail = (): string =>
  `e2e-${crypto.randomUUID().slice(0, 8)}-${Date.now().toString()}@example.com`;

/** Registers `email` with the name and password above, from the navbar. */
const register = async (
  page: DeepReadonly<Page>,
  email: string,
): Promise<void> => {
  await page.goto('/');

  await page.getByTestId('nav-register').click();

  const registerPage = page.getByTestId('register-page');

  await registerPage.getByTestId('username').fill(username);

  await registerPage.getByTestId('email').fill(email);

  await registerPage.getByTestId('password').fill(password);

  await registerPage.getByTestId('verify-password').fill(password);

  await registerPage.getByTestId('register-button').click();

  await expect
    .soft(toastWith(page, 'アカウントを作成しました。'))
    .toBeVisible({ timeout: authCallTimeout });

  await expect.soft(page.getByTestId('create-page')).toBeVisible();

  await expect.soft(page.getByTestId('nav-user-menu')).toHaveText(username);
};

/** Opens the dialog `item` names, from the user menu's account settings. */
const openAccountSetting = async (
  page: DeepReadonly<Page>,
  item: string,
): Promise<Locator> => {
  // A success toast stays 2s, over the place the submenu opens.
  await expect.soft(page.getByRole('alert')).toHaveCount(0);

  await page.getByTestId('nav-user-menu').click();

  await page.getByRole('menuitem', { name: 'アカウント設定' }).hover();

  await page.getByRole('menuitem', { name: item }).click();

  const dialog = page.getByRole('dialog');

  await expect.soft(dialog).toBeVisible();

  return dialog;
};

/** Signs out from the user menu, which leads to the sign-in page. */
const signOut = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.getByTestId('nav-user-menu').click();

  await page.getByRole('menuitem', { name: 'ログアウト' }).click();

  await expect.soft(page.getByTestId('nav-sign-in')).toBeVisible();

  await expect.soft(page.getByTestId('sign-in-page')).toBeVisible();
};
