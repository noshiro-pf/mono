import { createState } from 'synstate';
import { createMemoryBrowser } from 'synstate-router';
import { Result } from 'ts-data-forge';
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

    assert.isDefined(store.state.getSnapshot().value.formState.email.error);

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
});

const fill = (store: RegisterPage): void => {
  store.inputUsernameHandler('alice');

  store.inputEmailHandler('alice@example.com');

  store.inputPasswordHandler('password123');

  store.inputPasswordConfirmationHandler('password123');
};

type FakeUser = Readonly<{ uid: string }>;

type AuthError = Readonly<{ code: string; message: string }>;

type Setup = Readonly<{
  store: RegisterPage;
  browser: ReturnType<typeof createMemoryBrowser>;
  calls: readonly string[];
}>;

const setup = (
  answer: () => Result<Readonly<{ user: FakeUser }>, AuthError>,
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

  return { store, browser, calls: mut_calls } as const;
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
