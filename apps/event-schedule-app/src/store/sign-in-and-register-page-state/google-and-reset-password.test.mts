import type { Toaster } from '@blueprintjs/core';
import { createMemoryBrowser } from 'tiny-router-observable';
import { Result } from 'ts-data-forge';
import { createAppRouter } from '../router-store.mjs';
import { createGoogleSignInStore } from './google-sign-in-state.mjs';
import { createResetPasswordPageStore } from './reset-password-page.mjs';

describe(createGoogleSignInStore, () => {
  test('signs in, then goes back to the page it was asked from', async () => {
    const { browser, router, toasts } = routerAt('/signIn/');

    const store = createGoogleSignInStore({
      api: {
        auth: {
          googleSignInWithPopup: () => Promise.resolve(Result.ok(undefined)),
        },
      },
      router,
      toast: Promise.resolve(toasts.toaster),
    });

    store.googleSignInClickHandler();

    assert.isTrue(store.googleSignInButtonDisabledState.getSnapshot().value);

    await settle();

    assert.isFalse(store.googleSignInButtonDisabledState.getSnapshot().value);

    assert.strictEqual(browser.url().pathname, '/event/abc/');

    assert.strictEqual(toasts.count(), 1);
  });

  test('stays and says so when it fails', async () => {
    const { browser, router, toasts } = routerAt('/signIn/');

    const store = createGoogleSignInStore({
      api: {
        auth: {
          googleSignInWithPopup: () => Promise.resolve(Result.err(undefined)),
        },
      },
      router,
      toast: Promise.resolve(toasts.toaster),
    });

    store.googleSignInClickHandler();

    await settle();

    assert.strictEqual(browser.url().pathname, '/signIn/');

    assert.strictEqual(toasts.count(), 1);
  });
});

describe(createResetPasswordPageStore, () => {
  test('sends the email, then goes back to the page it was asked from', async () => {
    const { browser, router, toasts } = routerAt('/signIn/');

    const mut_sent: string[] = [];

    const store = createResetPasswordPageStore({
      api: {
        auth: {
          sendPasswordResetEmail: (email) => {
            mut_sent.push(email);

            return Promise.resolve(Result.ok(undefined));
          },
        },
      },
      router,
      toast: Promise.resolve(toasts.toaster),
    });

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(mut_sent, ['alice@example.com']);

    assert.strictEqual(browser.url().pathname, '/event/abc/');
  });

  test('says when no such user exists, and stays', async () => {
    const { browser, router, toasts } = routerAt('/signIn/');

    const store = createResetPasswordPageStore({
      api: {
        auth: {
          sendPasswordResetEmail: () =>
            Promise.resolve(
              Result.err({ code: 'auth/user-not-found', message: '' }),
            ),
        },
      },
      router,
      toast: Promise.resolve(toasts.toaster),
    });

    store.inputEmailHandler('nobody@example.com');

    store.enterClickHandler();

    await settle();

    assert.isDefined(store.state.getSnapshot().value.formState.email.error);

    assert.strictEqual(browser.url().pathname, '/signIn/');
  });
});

/** A router that came to `pathname` from an event's answer page. */
const routerAt = (
  pathname: string,
): Readonly<{
  browser: ReturnType<typeof createMemoryBrowser>;
  router: ReturnType<typeof createAppRouter>;
  toasts: Readonly<{ toaster: Toaster; count: () => number }>;
}> => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push(pathname);

  const mut_toasts = { count: 0 };

  return {
    browser,
    router,
    toasts: {
      toaster: {
        show: () => {
          mut_toasts.count += 1;

          return `toast-${mut_toasts.count}`;
        },
        dismiss: () => undefined,
        clear: () => undefined,
        getToasts: () => [],
      },
      count: () => mut_toasts.count,
    },
  } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
