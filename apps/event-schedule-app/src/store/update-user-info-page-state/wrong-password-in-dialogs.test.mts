import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import type {
  AccountAuth,
  AccountAuthApi,
  AccountUser,
  AuthError,
} from './account-deps.mjs';
import { createDeleteAccountPageStore } from './delete-account-page.mjs';
import { createUpdateEmailPageStore } from './update-email-page.mjs';
import { createUpdatePasswordPageStore } from './update-password-page.mjs';
import { createUpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

// How the three dialogs that sign the user in again with a password show that
// signing in again failed. With email enumeration protection on, Firebase
// reports a wrong password as `auth/invalid-credential`, not
// `auth/wrong-password` (#2955).

const dc = dict.accountSettings.reauthenticate.message;

describe(createDeleteAccountPageStore, () => {
  // The email is typed here too, so `auth/invalid-credential` cannot say which
  // of the two is wrong.
  test.each([
    { code: 'auth/wrong-password', expected: dc.wrongPassword },
    { code: 'auth/invalid-credential', expected: dc.wrongEmailOrPassword },
  ] as const)(
    'marks the password on $code, deletes nothing and stays open',
    async ({ code, expected }) => {
      const { deps, calls, dialog, toasts } = setup(code);

      const store = createDeleteAccountPageStore(deps);

      dialog.deleteAccount();

      store.inputEmailHandler('alice@example.com');

      store.inputPasswordHandler('wrong');

      store.enterClickHandler();

      await settle();

      assert.deepStrictEqual(calls, ['reauthenticate']);

      const { formState } = store.state.getSnapshot().value;

      assert.strictEqual(formState.password.error, expected);

      assert.isFalse(formState.isWaitingResponse);

      assert.deepStrictEqual(toasts, []);

      assert.strictEqual(
        dialog.openingDialogType$.getSnapshot().value,
        'deleteAccount',
      );
    },
  );

  test('after auth/invalid-credential, fixing the email clears the password error', async () => {
    const { deps } = setup('auth/invalid-credential');

    const store = createDeleteAccountPageStore(deps);

    deps.dialog.deleteAccount();

    store.inputEmailHandler('alice@example.co');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    store.inputEmailHandler('alice@example.com');

    const { formState, enterButtonDisabled } = store.state.getSnapshot().value;

    assert.isUndefined(formState.password.error);

    assert.strictEqual(formState.password.inputValue, 'password123');

    assert.isFalse(enterButtonDisabled);
  });

  test('any other failure closes it with a toast', async () => {
    const { deps, calls, dialog, toasts } = setup('auth/too-many-requests');

    const store = createDeleteAccountPageStore(deps);

    dialog.deleteAccount();

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('password123');

    silenceConsoleError();

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, ['reauthenticate']);

    assert.deepStrictEqual(toasts, [['danger', dc.error]]);

    assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);
  });
});

describe(createUpdateEmailPageStore, () => {
  // The email signed in with is the user's own, so only the password can be
  // wrong.
  test.each(['auth/wrong-password', 'auth/invalid-credential'] as const)(
    'marks the password on %s, changes nothing and stays open',
    async (code) => {
      const { deps, calls, dialog, toasts } = setup(code);

      const store = createUpdateEmailPageStore(deps);

      dialog.changeEmail();

      store.inputEmailHandler('alicia@example.com');

      store.inputPasswordHandler('wrong');

      store.enterClickHandler();

      await settle();

      assert.deepStrictEqual(calls, ['reauthenticate']);

      const { formState } = store.state.getSnapshot().value;

      assert.strictEqual(formState.password.error, dc.wrongPassword);

      assert.isFalse(formState.isWaitingResponse);

      assert.deepStrictEqual(toasts, []);

      assert.strictEqual(
        dialog.openingDialogType$.getSnapshot().value,
        'updateEmail',
      );
    },
  );
});

describe(createUpdatePasswordPageStore, () => {
  // As above: the email is the user's own.
  test.each(['auth/wrong-password', 'auth/invalid-credential'] as const)(
    'marks the current password on %s, changes nothing and stays open',
    async (code) => {
      const { deps, calls, dialog, toasts } = setup(code);

      const store = createUpdatePasswordPageStore(deps);

      dialog.changePassword();

      store.inputOldPasswordHandler('wrong');

      store.inputNewPasswordHandler('password456');

      store.inputNewPasswordConfirmationHandler('password456');

      store.enterClickHandler();

      await settle();

      assert.deepStrictEqual(calls, ['reauthenticate']);

      const { formState } = store.state.getSnapshot().value;

      assert.strictEqual(formState.oldPassword.error, dc.wrongPassword);

      assert.isFalse(formState.isWaitingResponse);

      assert.deepStrictEqual(toasts, []);

      assert.strictEqual(
        dialog.openingDialogType$.getSnapshot().value,
        'updatePassword',
      );
    },
  );

  test('any other failure closes it with a toast', async () => {
    const { deps, calls, dialog, toasts } = setup('auth/user-mismatch');

    const store = createUpdatePasswordPageStore(deps);

    dialog.changePassword();

    store.inputOldPasswordHandler('password123');

    store.inputNewPasswordHandler('password456');

    store.inputNewPasswordConfirmationHandler('password456');

    silenceConsoleError();

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, ['reauthenticate']);

    assert.deepStrictEqual(toasts, [['danger', dc.error]]);

    assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);
  });
});

const alice: AccountUser = {
  email: 'alice@example.com',
  displayName: 'alice',
} as const;

type Setup = Readonly<{
  deps: Readonly<{
    api: Readonly<{ auth: AccountAuthApi<AccountUser, undefined> }>;
    auth: AccountAuth<AccountUser>;
    dialog: ReturnType<typeof createUpdateUserInfoDialogStore>;
    toast: Promise<Toaster>;
  }>;
  /** What was asked of the API; only signing in again is expected. */
  calls: readonly string[];
  dialog: ReturnType<typeof createUpdateUserInfoDialogStore>;
  /** `[intent, message]` of each toast shown. */
  toasts: readonly FixedLengthTuple<2, unknown>[];
}>;

/** Signing in again fails with `code`; anything after it is only recorded. */
const setup = (code: string): Setup => {
  const [fireAuthUser$] = createState<AccountUser | undefined>(alice);

  const dialog = createUpdateUserInfoDialogStore();

  const mut_calls: string[] = [];

  const mut_toasts: FixedLengthTuple<2, unknown>[] = [];

  const recorded = (call: string): Promise<Result<undefined, AuthError>> => {
    mut_calls.push(call);

    return Promise.resolve(Result.ok(undefined));
  };

  const toaster: Toaster = {
    show: (props) => {
      mut_toasts.push([props.intent, props.message]);

      return 'toast';
    },
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
    remove: () => undefined,
  } as const;

  return {
    deps: {
      api: {
        auth: {
          emailCredential: () => undefined,
          reauthenticateWithGooglePopup: () => recorded('google'),
          reauthenticateWithCredential: () => {
            mut_calls.push('reauthenticate');

            return Promise.resolve(Result.err({ code, message: code }));
          },
          deleteUser: () => recorded('deleteUser'),
          update: {
            displayName: () => recorded('update.displayName'),
            password: () => recorded('update.password'),
          },
          verifyBeforeUpdateEmail: () => recorded('verifyBeforeUpdateEmail'),
        },
      },
      auth: {
        fireAuthUser$,
        getFireAuthUserSnapshot: () => alice,
        emitAuthStateChange: () => {
          mut_calls.push('emitAuthStateChange');
        },
      },
      dialog,
      toast: Promise.resolve(toaster),
    },
    calls: mut_calls,
    dialog,
    toasts: mut_toasts,
  } as const;
};

const silenceConsoleError = (): void => {
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  onTestFinished(() => {
    consoleError.mockRestore();
  });
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
