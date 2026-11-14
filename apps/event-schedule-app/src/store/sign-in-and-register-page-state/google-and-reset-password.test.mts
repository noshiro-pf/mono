import { createMemoryBrowser, type Href } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import { routes } from '../../constants/index.mjs';
import { createAppRouter } from '../router-store.mjs';
import { createGoogleSignInStore } from './google-sign-in-state.mjs';
import { createResetPasswordPageStore } from './reset-password-page.mjs';

describe(createGoogleSignInStore, () => {
  test('signs in, then goes back to the page it was asked from', async () => {
    const { browser, router, toasts } = routerAt(routes.signIn.href());

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

    assert.isTrue(
      Optional.unwrap(store.googleSignInButtonDisabledState.getSnapshot()),
    );

    await settle();

    assert.isFalse(
      Optional.unwrap(store.googleSignInButtonDisabledState.getSnapshot()),
    );

    assert.strictEqual(browser.url().pathname, '/event/abc/');

    assert.strictEqual(toasts.count(), 1);
  });

  // #3415: the popup may stay open while the user goes elsewhere.
  test('after leaving and coming back while the popup is open, a success navigates nowhere', async () => {
    const { browser, router, toasts } = routerAt(routes.signIn.href());

    const popup = Promise.withResolvers<Result<unknown, unknown>>();

    const store = createGoogleSignInStore({
      api: { auth: { googleSignInWithPopup: () => popup.promise } },
      router,
      toast: Promise.resolve(toasts.toaster),
    });

    store.googleSignInClickHandler();

    router.push(routes.create.href());

    router.push(routes.signIn.href());

    popup.resolve(Result.ok(undefined));

    await settle();

    assert.strictEqual(browser.url().pathname, '/signIn/');

    assert.isFalse(
      Optional.unwrap(store.googleSignInButtonDisabledState.getSnapshot()),
    );

    // Signed in all the same.
    assert.strictEqual(toasts.count(), 1);
  });

  test('stays and says so when it fails', async () => {
    const { browser, router, toasts } = routerAt(routes.signIn.href());

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
    const { browser, router, toasts } = routerAt(routes.signIn.href());

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

  // #3415: a slow answer for a visit already left belongs to no form.
  test('after leaving and coming back while sending, navigates nowhere and sets no field', async () => {
    const { browser, router, toasts } = routerAt(routes.signIn.href());

    const pending =
      Promise.withResolvers<
        Result<undefined, Readonly<{ code: string; message: string }>>
      >();

    const store = createResetPasswordPageStore({
      api: { auth: { sendPasswordResetEmail: () => pending.promise } },
      router,
      toast: Promise.resolve(toasts.toaster),
    });

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    router.push(routes.create.href());

    router.push(routes.signIn.href());

    pending.resolve(Result.ok(undefined));

    await settle();

    assert.strictEqual(browser.url().pathname, '/signIn/');

    assert.isFalse(
      Optional.unwrap(store.state.getSnapshot()).formState.isWaitingResponse,
    );
  });

  test('says when no such user exists, and stays', async () => {
    const { browser, router, toasts } = routerAt(routes.signIn.href());

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

    assert.isDefined(
      Optional.unwrap(store.state.getSnapshot()).formState.email.error,
    );

    assert.strictEqual(browser.url().pathname, '/signIn/');
  });
});

/** A router that came to `href` from an event's answer page. */
const routerAt = (
  href: Href,
): Readonly<{
  browser: ReturnType<typeof createMemoryBrowser>;
  router: ReturnType<typeof createAppRouter>;
  toasts: Readonly<{ toaster: Toaster; count: () => number }>;
}> => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push(href);

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
        remove: () => undefined,
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
