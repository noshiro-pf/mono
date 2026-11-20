import { expect, type Page } from '@playwright/test';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import { authCallTimeout, toastWith } from './answer-page-steps.mjs';

// Steps shared by the specs that register an account, against the emulators'
// Auth.

export const password = 'e2e-password';

export const username = 'e2e-user';

/**
 * Unique per call, so that a retry, or a second run against the same emulators,
 * can register again.
 */
export const uniqueEmail = (): string =>
  `e2e-${crypto.randomUUID().slice(0, 8)}-${Date.now().toString()}@example.com`;

/** Registers `email` with `username` and `password`, from the navbar. */
export const register = async (
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

/** Signs out from the user menu, which leads to the sign-in page. */
export const signOut = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.getByTestId('nav-user-menu').click();

  await page.getByRole('menuitem', { name: 'ログアウト' }).click();

  await expect.soft(page.getByTestId('nav-sign-in')).toBeVisible();

  await expect.soft(page.getByTestId('sign-in-page')).toBeVisible();
};

/** Signs in with `email` and `password` from the sign-in page. */
export const signIn = async (
  page: DeepReadonly<Page>,
  email: string,
): Promise<void> => {
  const signInPage = page.getByTestId('sign-in-page');

  await signInPage.getByTestId('email').fill(email);

  await signInPage.getByTestId('password').fill(password);

  await signInPage.getByTestId('sign-in-button').click();

  await expect
    .soft(toastWith(page, 'ログインしました。'))
    .toBeVisible({ timeout: authCallTimeout });
};

/**
 * Opens the link the Auth emulator recorded as sent to change an address to
 * `newEmail`, as its owner would from the mail.
 */
export const openEmailChangeLink = async (
  page: DeepReadonly<Page>,
  newEmail: string,
): Promise<void> => {
  await openOobLink(
    page,
    (code) =>
      code['requestType'] === 'VERIFY_AND_CHANGE_EMAIL' &&
      code['newEmail'] === newEmail,
    `an email change link to ${newEmail}`,
  );
};

/**
 * Opens the link the Auth emulator recorded as sent to verify `email`, which
 * `register` has it send. The page holds the account as it was signed in, so it
 * sees the email as verified only once signed in again.
 */
export const openEmailVerificationLink = async (
  page: DeepReadonly<Page>,
  email: string,
): Promise<void> => {
  await openOobLink(
    page,
    (code) => code['requestType'] === 'VERIFY_EMAIL' && code['email'] === email,
    `an email verification link to ${email}`,
  );
};

/**
 * `ts-data-forge`'s `isRecord`, written out: the daily job against production
 * imports every spec and builds no workspace package (see `productionE2eRules`
 * in `eslint.config.mts`).
 */
const isObject = (u: unknown): u is ReadonlyRecord<string, unknown> =>
  typeof u === 'object' && u !== null && !Array.isArray(u);

/**
 * Opens the link of the first code the Auth emulator's `oobCodes` endpoint
 * lists that `matches`. `firebase emulators:exec` gives the tests the
 * emulator's host and the project.
 */
const openOobLink = async (
  page: DeepReadonly<Page>,
  matches: (code: ReadonlyRecord<string, unknown>) => boolean,
  what: string,
): Promise<void> => {
  const host = process.env['FIREBASE_AUTH_EMULATOR_HOST'];

  const projectId = process.env['GCLOUD_PROJECT'];

  if (host === undefined || projectId === undefined) {
    throw new Error(
      'FIREBASE_AUTH_EMULATOR_HOST and GCLOUD_PROJECT are unset: run this under `check:e2e:emulators`',
    );
  }

  const response = await page.request.get(
    `http://${host}/emulator/v1/projects/${projectId}/oobCodes`,
  );

  if (!response.ok()) {
    throw new Error(
      `The Auth emulator's oobCodes endpoint answered ${response.status().toString()}`,
    );
  }

  const body: unknown = await response.json();

  const codes: unknown = isObject(body) ? body['oobCodes'] : undefined;

  const found: unknown = Array.isArray(codes)
    ? codes.find((c: unknown) => isObject(c) && matches(c))
    : undefined;

  const oobLink: unknown = isObject(found) ? found['oobLink'] : undefined;

  if (typeof oobLink !== 'string') {
    throw new TypeError(`The Auth emulator sent no ${what}`);
  }

  // The emulator's action page applies the code when it is fetched.
  const applied = await page.request.get(oobLink);

  expect.soft(applied.ok()).toBe(true);
};
