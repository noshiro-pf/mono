import { test as base, expect, type APIRequestContext } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// A mistyped password, on the sign-in page and in a dialog that signs the user
// in again, with email enumeration protection on: Firebase then reports it as
// `auth/invalid-credential` rather than `auth/wrong-password` (#2955). Signs in
// to the Auth emulator, so it runs through `check:e2e:emulators`, and
// `check:e2e` leaves it out by this tag.

/** `firebase.json`'s Auth emulator. */
const authEmulator = 'http://localhost:9099';

/**
 * `emulatorProjectId` of `src/api/emulator-mode.mts`, which is reached only
 * through the `src/api/` barrel, and that would load the Firebase app here.
 */
const emulatorProjectId = 'demo-event-schedule-app';

const password = 'correct-password';

const displayName = 'password-errors';

const signUp = async (
  request: DeepReadonly<APIRequestContext>,
): Promise<string> => {
  const email = `password-errors-${crypto.randomUUID()}@example.com`;

  const res = await request.post(
    `${authEmulator}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=any`,
    { data: { email, password, displayName } },
  );

  if (!res.ok()) {
    throw new Error(`signUp failed: ${res.status()} ${await res.text()}`);
  }

  return email;
};

const setEmailEnumerationProtection = async (
  request: DeepReadonly<APIRequestContext>,
  on: boolean,
): Promise<void> => {
  const res = await request.patch(
    `${authEmulator}/emulator/v1/projects/${emulatorProjectId}/config`,
    {
      headers: { Authorization: 'Bearer owner' },
      data: { emailPrivacyConfig: { enableImprovedEmailPrivacy: on } },
    },
  );

  if (!res.ok()) {
    throw new Error(
      `Setting enableImprovedEmailPrivacy failed: ${res.status()} ${await res.text()}`,
    );
  }
};

/**
 * `email` is an account of the test's own to sign in with, since the emulator
 * keeps accounts until it stops, made with the protection on: the emulator,
 * like an older Firebase project, starts with it off. It is turned off again
 * however the test ends, so that no other spec runs with it.
 */
const test = base.extend<Readonly<{ email: string }>>({
  email: async ({ request }, provide) => {
    await setEmailEnumerationProtection(request, true);

    try {
      await provide(await signUp(request));
    } finally {
      await setEmailEnumerationProtection(request, false);
    }
  },
});

test(
  'a wrong password on the sign-in page marks the password field',
  { tag: '@emulators' },
  async ({ page, email }) => {
    await page.goto('/signIn/');

    await page.getByTestId('email').fill(email);

    await page.getByTestId('password').fill('wrong-password');

    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    await expect
      .soft(page.getByText('メールアドレスまたはパスワードが間違っています。'))
      .toBeVisible();

    await expect
      .soft(page.getByText('ログインに失敗しました。'))
      .toHaveCount(0);

    await expect.soft(page).toHaveURL(/\/signIn\/$/u);
  },
);

test(
  'a wrong current password in the change-password dialog marks it and keeps the dialog open',
  { tag: '@emulators' },
  async ({ page, email }) => {
    await page.goto('/signIn/');

    await page.getByTestId('email').fill(email);

    await page.getByTestId('password').fill(password);

    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    await page.getByText(displayName, { exact: true }).click();

    await page.getByText('アカウント設定', { exact: true }).hover();

    await page.getByText('パスワードを変更', { exact: true }).click();

    const dialog = page.getByRole('dialog');

    await dialog.getByTestId('old-password').fill('wrong-password');

    await dialog.getByTestId('new-password').fill('new-password');

    await dialog.getByTestId('verify-new-password').fill('new-password');

    await dialog.getByRole('button', { name: '更新する', exact: true }).click();

    await expect
      .soft(dialog.getByText('パスワードが間違っています。'))
      .toBeVisible();

    await expect
      .soft(page.getByText('再認証でエラーが発生しました。'))
      .toHaveCount(0);
  },
);
