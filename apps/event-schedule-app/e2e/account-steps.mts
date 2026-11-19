import { expect, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';
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
