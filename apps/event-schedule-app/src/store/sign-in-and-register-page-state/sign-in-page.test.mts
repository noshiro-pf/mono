import type { Toaster } from '@blueprintjs/core';
import { createState } from 'synstate';
import { createMemoryBrowser } from 'tiny-router-observable';
import { Result } from 'ts-data-forge';
import { createAppRouter } from '../router-store.mjs';
import { createSignInPageStore, type SignInPage } from './sign-in-page.mjs';

describe(createSignInPageStore, () => {
  test('signs in, then goes back to the page it was asked from', async () => {
    const { store, browser, calls, toasts } = setup(() => Result.ok({}));

    fill(store);

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, ['signIn alice@example.com password123']);

    assert.strictEqual(browser.url().pathname, '/event/abc/');

    assert.strictEqual(toasts.count, 1);
  });

  test('says which field is wrong', async () => {
    const { store, browser } = setup(() =>
      Result.err({ code: 'auth/wrong-password', message: '' }),
    );

    fill(store);

    store.enterClickHandler();

    await settle();

    assert.isDefined(store.state.getSnapshot().value.formState.password.error);

    assert.strictEqual(browser.url().pathname, '/signIn/');
  });

  test('does nothing while the form has an error', async () => {
    const { store, calls } = setup(() => Result.ok({}));

    store.inputEmailHandler('not an email');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, []);
  });

  test('waits while a Google sign-in is under way', async () => {
    const { store, calls, setGoogleSignInUnderWay } = setup(() =>
      Result.ok({}),
    );

    fill(store);

    setGoogleSignInUnderWay(true);

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, []);
  });

  test('the password lock toggles', () => {
    const { store } = setup(() => Result.ok({}));

    store.togglePasswordLock();

    assert.isTrue(store.state.getSnapshot().value.passwordIsOpen);
  });
});

const fill = (store: SignInPage): void => {
  store.inputEmailHandler('alice@example.com');

  store.inputPasswordHandler('password123');
};

type Setup = Readonly<{
  store: SignInPage;
  browser: ReturnType<typeof createMemoryBrowser>;
  calls: readonly string[];
  toasts: Readonly<{ count: number }>;
  setGoogleSignInUnderWay: (underWay: boolean) => void;
}>;

const setup = (
  answer: () => Result<unknown, Readonly<{ code: string; message: string }>>,
): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push('/signIn/');

  const [googleSignInButtonDisabledState, setGoogleSignInUnderWay] =
    createState(false);

  const mut_calls: string[] = [];

  const mut_toasts = { count: 0 };

  const store = createSignInPageStore({
    api: {
      auth: {
        signIn: (email, password) => {
          mut_calls.push(`signIn ${email} ${password}`);

          return Promise.resolve(answer());
        },
      },
    },
    router,
    googleSignIn: { googleSignInButtonDisabledState },
    toast: Promise.resolve(
      fakeToaster(() => {
        mut_toasts.count += 1;

        return mut_toasts.count;
      }),
    ),
  });

  return {
    store,
    browser,
    calls: mut_calls,
    toasts: mut_toasts,
    setGoogleSignInUnderWay,
  } as const;
};

/** A toaster that only counts what it is asked to show. */
const fakeToaster = (onShow: () => number): Toaster =>
  ({
    show: () => `toast-${onShow()}`,
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
  }) as const;

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
