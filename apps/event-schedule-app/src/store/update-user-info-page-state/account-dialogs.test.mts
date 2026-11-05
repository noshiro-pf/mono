import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { Result } from 'ts-data-forge';
import { dict } from '../../constants/index.mjs';
import type {
  AccountAuth,
  AccountAuthApi,
  AccountUser,
  AuthError,
} from './account-deps.mjs';
import { createDeleteAccountCreatedWithGoogleStore } from './delete-account-page-google.mjs';
import { createDeleteAccountPageStore } from './delete-account-page.mjs';
import { createUpdateDisplayNamePageStore } from './update-display-name-page.mjs';
import { createUpdateEmailPageStore } from './update-email-page.mjs';
import { createUpdatePasswordPageStore } from './update-password-page.mjs';
import { createUpdateUserInfoDialogStore } from './update-user-info-dialog-state.mjs';

describe(createUpdateUserInfoDialogStore, () => {
  test('opens one dialog at a time, and closes it', () => {
    const dialog = createUpdateUserInfoDialogStore();

    dialog.changeEmail();

    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'updateEmail',
    );

    dialog.deleteAccount();

    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'deleteAccount',
    );

    dialog.closeDialog();

    assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);
  });
});

describe(createDeleteAccountPageStore, () => {
  test('signs in again with the email and password, deletes the user and closes', async () => {
    const { deps, calls, dialog } = setup();

    const store = createDeleteAccountPageStore(deps);

    dialog.deleteAccount();

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
      'deleteUser alice',
    ]);

    assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);
  });

  test('says the password is wrong, keeps the user and stays open', async () => {
    const { deps, calls, dialog } = setup({
      reauthenticate: Result.err({ code: 'auth/wrong-password', message: '' }),
    });

    const store = createDeleteAccountPageStore(deps);

    dialog.deleteAccount();

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('wrong-password');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,wrong-password)',
    ]);

    assert.isDefined(store.state.getSnapshot().value.formState.password.error);

    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'deleteAccount',
    );
  });

  test('does nothing while nobody is signed in', async () => {
    const { deps, calls } = setup({ signedIn: false });

    const store = createDeleteAccountPageStore(deps);

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, []);
  });
});

describe(createDeleteAccountCreatedWithGoogleStore, () => {
  test('re-authenticates the user with Google, then deletes them', async () => {
    const { deps, calls, dialog } = setup();

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticateWithGooglePopup alice',
      'deleteUser alice',
    ]);

    assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);
  });

  test.each([
    { code: 'auth/popup-closed-by-user', toasts: [], errors: 0 },
    { code: 'auth/cancelled-popup-request', toasts: [], errors: 0 },
    {
      code: 'auth/user-mismatch',
      toasts: [
        ['danger', constant(dict.accountSettings.reauthenticate.message.error)],
      ],
      errors: 1,
    },
  ] as const)(
    'deletes nothing when re-authentication fails with $code',
    async ({ code, toasts, errors }) => {
      const { deps, calls, dialog } = setup({
        reauthenticateWithGoogle: Result.err({ code, message: code }),
      });

      const store = createDeleteAccountCreatedWithGoogleStore(deps);

      dialog.deleteAccountCreatedWithGoogle();

      store.inputEmailHandler('alice@example.com');

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      const showToast = vi.spyOn(fakeToaster, 'show');

      onTestFinished(() => {
        consoleError.mockRestore();

        showToast.mockRestore();
      });

      store.enterClickHandler();

      await settle();

      assert.deepStrictEqual(calls, ['reauthenticateWithGooglePopup alice']);

      // A popup closed on purpose is not an error; a real failure names its
      // code in the log.
      assert.strictEqual(consoleError.mock.calls.length, errors);

      assert.isTrue(
        consoleError.mock.calls.every((args) => args.includes(code)),
      );

      // The dialog stays open so that re-authenticating can be tried again, and
      // is not waiting any more.
      assert.isFalse(store.state.getSnapshot().value.isWaitingResponse);

      assert.strictEqual(
        dialog.openingDialogType$.getSnapshot().value,
        'deleteAccountCreatedWithGoogle',
      );

      const shown: readonly (readonly unknown[])[] = showToast.mock.calls.map(
        ([props]) => [props.intent, props.message],
      );

      assert.deepStrictEqual(shown, toasts);
    },
  );
});

describe(createUpdateDisplayNamePageStore, () => {
  test('starts from the current name, saves the new one and reads the user again', async () => {
    const { deps, calls, dialog } = setup();

    const store = createUpdateDisplayNamePageStore(deps);

    dialog.changeUsername();

    assert.strictEqual(
      store.state.getSnapshot().value.formState.displayName.inputValue,
      'alice',
    );

    store.inputDisplayNameHandler('alicia');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'update.displayName alice alicia',
      'emitAuthStateChange',
    ]);

    assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);
  });
});

describe(createUpdateEmailPageStore, () => {
  test('starts from the current email, signs in again, then changes it', async () => {
    const { deps, calls, dialog } = setup();

    const store = createUpdateEmailPageStore(deps);

    dialog.changeEmail();

    assert.strictEqual(
      store.state.getSnapshot().value.formState.email.inputValue,
      'alice@example.com',
    );

    store.inputEmailHandler('alicia@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
      'update.email alice alicia@example.com',
    ]);
  });
});

describe(createUpdatePasswordPageStore, () => {
  test('signs in again with the old password, then sets the new one', async () => {
    const { deps, calls, dialog } = setup();

    const store = createUpdatePasswordPageStore(deps);

    dialog.changePassword();

    store.inputOldPasswordHandler('password123');

    store.inputNewPasswordHandler('password456');

    store.inputNewPasswordConfirmationHandler('password456');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
      'update.password alice password456',
    ]);
  });

  test('does nothing while the new passwords differ', async () => {
    const { deps, calls, dialog } = setup();

    const store = createUpdatePasswordPageStore(deps);

    dialog.changePassword();

    store.inputOldPasswordHandler('password123');

    store.inputNewPasswordHandler('password456');

    store.inputNewPasswordConfirmationHandler('password789');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, []);
  });
});

type FakeUser = AccountUser & Readonly<{ name: string }>;

const alice: FakeUser = {
  name: 'alice',
  email: 'alice@example.com',
  displayName: 'alice',
} as const;

type Setup = Readonly<{
  deps: Readonly<{
    api: Readonly<{ auth: AccountAuthApi<FakeUser, string> }>;
    auth: AccountAuth<FakeUser>;
    dialog: ReturnType<typeof createUpdateUserInfoDialogStore>;
    toast: Promise<Toaster>;
  }>;
  calls: readonly string[];
  dialog: ReturnType<typeof createUpdateUserInfoDialogStore>;
}>;

const setup = (
  options?: Readonly<{
    signedIn?: boolean;
    reauthenticate?: Result<unknown, AuthError>;
    reauthenticateWithGoogle?: Result<unknown, AuthError>;
  }>,
): Setup => {
  const user = options?.signedIn === false ? undefined : alice;

  const [fireAuthUser$] = createState<FakeUser | undefined>(user);

  const dialog = createUpdateUserInfoDialogStore();

  const mut_calls: string[] = [];

  const ok = (call: string): Promise<Result<undefined, AuthError>> => {
    mut_calls.push(call);

    return Promise.resolve(Result.ok(undefined));
  };

  return {
    deps: {
      api: {
        auth: {
          emailCredential: (email, password) => `cred(${email},${password})`,
          reauthenticateWithGooglePopup: (u) => {
            mut_calls.push(`reauthenticateWithGooglePopup ${u.name}`);

            return Promise.resolve(
              options?.reauthenticateWithGoogle ?? Result.ok(undefined),
            );
          },
          reauthenticateWithCredential: (u, credential) => {
            mut_calls.push(`reauthenticate ${u.name} ${credential}`);

            return Promise.resolve(
              options?.reauthenticate ?? Result.ok(undefined),
            );
          },
          deleteUser: (u) => ok(`deleteUser ${u.name}`),
          update: {
            displayName: (u, displayName) =>
              ok(`update.displayName ${u.name} ${displayName}`),
            email: (u, email) => ok(`update.email ${u.name} ${email}`),
            password: (u, password) =>
              ok(`update.password ${u.name} ${password}`),
          },
        },
      },
      auth: {
        fireAuthUser$,
        getFireAuthUserSnapshot: () => user,
        emitAuthStateChange: () => {
          mut_calls.push('emitAuthStateChange');
        },
      },
      dialog,
      toast: Promise.resolve(fakeToaster),
    },
    calls: mut_calls,
    dialog,
  } as const;
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
