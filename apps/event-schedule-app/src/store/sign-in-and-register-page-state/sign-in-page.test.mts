import { createState } from 'synstate';
import { createMemoryBrowser } from 'synstate-router';
import { Result } from 'ts-data-forge';
import { dict, routes } from '../../constants/index.mjs';
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

  test.each([
    {
      code: 'auth/wrong-password',
      email: undefined,
      password: dict.register.message.error.wrongPassword,
    },
    {
      code: 'auth/user-not-found',
      email: dict.register.message.error.userNotFound,
      password: undefined,
    },
    // Email enumeration protection reports both of the above this way, so the
    // page cannot say which of the two is wrong.
    {
      code: 'auth/invalid-credential',
      email: undefined,
      password: dict.register.message.error.wrongEmailOrPassword,
    },
  ] as const)(
    'says which field is wrong on $code, without a toast',
    async ({ code, email, password }) => {
      const { store, browser, toasts } = setup(() =>
        Result.err({ code, message: '' }),
      );

      fill(store);

      store.enterClickHandler();

      await settle();

      const { formState } = store.state.getSnapshot().value;

      assert.strictEqual(formState.email.error, email);

      assert.strictEqual(formState.password.error, password);

      assert.isUndefined(formState.otherErrors);

      assert.strictEqual(toasts.count, 0);

      assert.strictEqual(browser.url().pathname, '/signIn/');
    },
  );

  test.each([
    { code: 'auth/invalid-credential', cleared: true },
    { code: 'auth/wrong-password', cleared: false },
  ] as const)(
    'after $code, fixing the email clears the password error: $cleared',
    async ({ code, cleared }) => {
      const { store } = setup(() => Result.err({ code, message: '' }));

      fill(store);

      store.enterClickHandler();

      await settle();

      store.inputEmailHandler('alicia@example.com');

      const { formState, enterButtonDisabled } =
        store.state.getSnapshot().value;

      // The message says the email may be what was wrong, so fixing it lets the
      // form be sent again without retyping the password.
      assert.strictEqual(formState.password.error === undefined, cleared);

      assert.strictEqual(formState.password.inputValue, 'password123');

      assert.strictEqual(enterButtonDisabled, !cleared);
    },
  );

  test('any other failure is a toast, with the message under the form', async () => {
    const { store, toasts } = setup(() =>
      Result.err({ code: 'auth/too-many-requests', message: 'slow down' }),
    );

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    onTestFinished(() => {
      consoleError.mockRestore();
    });

    fill(store);

    store.enterClickHandler();

    await settle();

    const { formState } = store.state.getSnapshot().value;

    assert.isUndefined(formState.password.error);

    assert.strictEqual(formState.otherErrors, 'slow down');

    assert.strictEqual(toasts.count, 1);
  });

  // #3415: a slow answer for a visit already left belongs to no form.
  test.each([
    {
      name: 'a success navigates nowhere',
      answer: Result.ok({}),
    },
    {
      name: 'an error sets no field',
      answer: Result.err({ code: 'auth/wrong-password', message: '' }),
    },
  ] as const)(
    'after leaving and coming back while signing in, $name',
    async ({ answer }) => {
      const pending = Promise.withResolvers<SignInAnswer>();

      const { store, router, browser } = setup(() => pending.promise);

      fill(store);

      store.enterClickHandler();

      await settle();

      router.push(routes.create.href());

      router.push(routes.signIn.href());

      store.inputEmailHandler('alicia@example.com');

      pending.resolve(answer);

      await settle();

      assert.strictEqual(browser.url().pathname, '/signIn/');

      const { formState } = store.state.getSnapshot().value;

      assert.strictEqual(formState.email.inputValue, 'alicia@example.com');

      assert.isUndefined(formState.password.error);

      assert.isFalse(formState.isWaitingResponse);
    },
  );

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

type SignInAnswer = Result<
  unknown,
  Readonly<{ code: string; message: string }>
>;

type Setup = Readonly<{
  store: SignInPage;
  router: ReturnType<typeof createAppRouter>;
  browser: ReturnType<typeof createMemoryBrowser>;
  calls: readonly string[];
  toasts: Readonly<{ count: number }>;
  setGoogleSignInUnderWay: (underWay: boolean) => void;
}>;

/** A toaster that only counts what it is asked to show. */
const fakeToaster = (onShow: () => number): Toaster =>
  ({
    show: () => `toast-${onShow()}`,
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
    remove: () => undefined,
  }) as const;

const setup = (answer: () => SignInAnswer | Promise<SignInAnswer>): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push(routes.signIn.href());

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
    router,
    browser,
    calls: mut_calls,
    toasts: mut_toasts,
    setGoogleSignInUnderWay,
  } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
