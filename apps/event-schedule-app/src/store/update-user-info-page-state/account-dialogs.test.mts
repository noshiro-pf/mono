import type { Toaster } from '@blueprintjs/core';
import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
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
  test('signs in with Google again, then deletes the user', async () => {
    const { deps, calls, dialog } = setup();

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'googleSignInWithPopup',
      'reauthenticate alice cred(google)',
      'deleteUser alice',
    ]);
  });

  test('deletes nothing when signing in with Google fails', async () => {
    const { deps, calls, dialog } = setup({ google: Result.err(undefined) });

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    store.enterClickHandler();

    await settle();

    consoleError.mockRestore();

    assert.deepStrictEqual(calls, ['googleSignInWithPopup']);
  });
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
    google?: Result<string | undefined, unknown>;
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
          googleSignInWithPopup: () => {
            mut_calls.push('googleSignInWithPopup');

            return Promise.resolve(
              options?.google ?? Result.ok('cred(google)'),
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
} as const;

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
