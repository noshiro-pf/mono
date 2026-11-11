import { createState } from 'synstate';
import { createMemoryBrowser } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import { routes } from '../../constants/index.mjs';
import { createAppRouter } from '../router-store.mjs';
import {
  createRegisterPageStore,
  type RegisterPage,
} from './register-page.mjs';

describe(createRegisterPageStore, () => {
  test('creates the user, names them, sends the verification, reads the user again, then goes back', async () => {
    const { store, browser, calls } = setup(() =>
      Result.ok({ user: { uid: 'u1' } }),
    );

    fill(store);

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'createUser alice@example.com',
      'displayName u1 alice',
      'sendEmailVerification u1',
      // Firebase reports no change for a name set in place.
      'emitAuthStateChange',
    ]);

    assert.strictEqual(browser.url().pathname, '/event/abc/');
  });

  test('says when the email is already in use, and stays', async () => {
    const { store, browser, calls } = setup(() =>
      Result.err({ code: 'auth/email-already-in-use', message: '' }),
    );

    fill(store);

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, ['createUser alice@example.com']);

    assert.isDefined(
      Optional.unwrap(store.state.getSnapshot()).formState.email.error,
    );

    assert.strictEqual(browser.url().pathname, '/register/');
  });

  test('does nothing while the passwords differ', async () => {
    const { store, calls } = setup(() => Result.ok({ user: { uid: 'u1' } }));

    fill(store);

    store.inputPasswordConfirmationHandler('something else');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, []);
  });

  // #3415: the account is made, but the page left belongs to no form.
  test('after leaving and coming back while registering, finishes the account and navigates nowhere', async () => {
    const pending = Promise.withResolvers<RegisterAnswer>();

    const { store, router, browser, calls } = setup(() => pending.promise);

    fill(store);

    store.enterClickHandler();

    await settle();

    router.push(routes.create.href());

    router.push(routes.register.href());

    pending.resolve(Result.ok({ user: { uid: 'u1' } }));

    await settle();

    assert.deepStrictEqual(calls, [
      'createUser alice@example.com',
      'displayName u1 alice',
      'sendEmailVerification u1',
      'emitAuthStateChange',
    ]);

    assert.strictEqual(browser.url().pathname, '/register/');

    assert.isFalse(
      Optional.unwrap(store.state.getSnapshot()).formState.isWaitingResponse,
    );
  });

  test('after leaving and coming back while registering, an error sets no field', async () => {
    const pending = Promise.withResolvers<RegisterAnswer>();

    const { store, router } = setup(() => pending.promise);

    fill(store);

    store.enterClickHandler();

    await settle();

    router.push(routes.create.href());

    router.push(routes.register.href());

    pending.resolve(
      Result.err({ code: 'auth/email-already-in-use', message: '' }),
    );

    await settle();

    const { formState } = Optional.unwrap(store.state.getSnapshot());

    assert.isUndefined(formState.email.error);

    assert.strictEqual(formState.email.inputValue, '');
  });
});

const fill = (store: RegisterPage): void => {
  store.inputUsernameHandler('alice');

  store.inputEmailHandler('alice@example.com');

  store.inputPasswordHandler('password123');

  store.inputPasswordConfirmationHandler('password123');
};

type FakeUser = Readonly<{ uid: string }>;

type AuthError = Readonly<{ code: string; message: string }>;

type RegisterAnswer = Result<Readonly<{ user: FakeUser }>, AuthError>;

type Setup = Readonly<{
  store: RegisterPage;
  router: ReturnType<typeof createAppRouter>;
  browser: ReturnType<typeof createMemoryBrowser>;
  calls: readonly string[];
}>;

const setup = (
  answer: () => RegisterAnswer | Promise<RegisterAnswer>,
): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push(routes.register.href());

  const [googleSignInButtonDisabledState] = createState(false);

  const mut_calls: string[] = [];

  const store = createRegisterPageStore<FakeUser>({
    api: {
      auth: {
        createUser: (email) => {
          mut_calls.push(`createUser ${email}`);

          return Promise.resolve(answer());
        },
        update: {
          displayName: (user, displayName) => {
            mut_calls.push(`displayName ${user.uid} ${displayName}`);

            return Promise.resolve(Result.ok(undefined));
          },
        },
        sendEmailVerification: (user) => {
          mut_calls.push(`sendEmailVerification ${user.uid}`);

          return Promise.resolve(Result.ok(undefined));
        },
      },
    },
    auth: {
      emitAuthStateChange: () => {
        mut_calls.push('emitAuthStateChange');
      },
    },
    router,
    googleSignIn: { googleSignInButtonDisabledState },
    toast: Promise.resolve(fakeToaster),
  });

  return { store, router, browser, calls: mut_calls } as const;
};

const fakeToaster: Toaster = {
  show: () => 'toast',
  dismiss: () => undefined,
  clear: () => undefined,
  getToasts: () => [],
  remove: () => undefined,
} as const;

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
