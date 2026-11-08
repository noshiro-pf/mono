import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
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

  test('signs in no further when the dialog is closed while signing in again', async () => {
    const reauth = Promise.withResolvers<Result<unknown, AuthError>>();

    const { deps, calls, dialog } = setup({
      reauthenticate: () => reauth.promise,
    });

    const store = createDeleteAccountPageStore(deps);

    const reports = watchReports();

    dialog.deleteAccount();

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.isTrue(store.state.getSnapshot().value.formState.isWaitingResponse);

    dialog.closeDialog();

    reauth.resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
    ]);

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), []);
  });

  test('a submit from before a reopen leaves the new one waiting and open', async () => {
    const reauthAnswers = [
      Promise.withResolvers<Result<unknown, AuthError>>(),
      Promise.withResolvers<Result<unknown, AuthError>>(),
    ] as const;

    const { deps, calls, dialog } = setup({
      reauthenticate: () => {
        const reauth = reauthAnswers.at(calls.length - 1);

        assert.isDefined(reauth);

        return reauth.promise;
      },
    });

    const store = createDeleteAccountPageStore(deps);

    const reports = watchReports();

    const fillAndSubmit = (): void => {
      dialog.deleteAccount();

      store.inputEmailHandler('alice@example.com');

      store.inputPasswordHandler('password123');

      store.enterClickHandler();
    };

    fillAndSubmit();

    await settle();

    dialog.closeDialog();

    fillAndSubmit();

    await settle();

    reauthAnswers[0].resolve(
      Result.err({ code: 'auth/user-mismatch', message: 'mismatch' }),
    );

    await settle();

    assert.isTrue(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'deleteAccount',
    );

    assert.deepStrictEqual(reports.toasts(), []);

    assert.strictEqual(reports.errors(), 1);

    reauthAnswers[1].resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
      'reauthenticate alice cred(alice@example.com,password123)',
      'deleteUser alice',
    ]);
  });

  test("ends the wait and reports a rejection as the step's error", async () => {
    const { deps, calls, dialog } = setup({
      reauthenticate: () => Promise.reject(new Error('network')),
    });

    const store = createDeleteAccountPageStore(deps);

    const reports = watchReports();

    dialog.deleteAccount();

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
    ]);

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), [
      ['danger', constant(dict.accountSettings.reauthenticate.message.error)],
    ]);

    assert.strictEqual(reports.errors(), 1);
  });

  test('says whether a deletion the dialog was closed during went through', async () => {
    const deletion = Promise.withResolvers<Result<undefined, AuthError>>();

    const { deps, dialog } = setup({
      respond: { deleteUser: () => deletion.promise },
    });

    const store = createDeleteAccountPageStore(deps);

    const reports = watchReports();

    dialog.deleteAccount();

    store.inputEmailHandler('alice@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    dialog.closeDialog();

    dialog.changeEmail();

    deletion.resolve(Result.ok(undefined));

    await settle();

    // The dialog opened meanwhile is not the one this submit closes.
    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'updateEmail',
    );

    assert.deepStrictEqual(reports.toasts(), [
      ['success', constant(dict.accountSettings.deleteAccount.message.success)],
    ]);
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

  test('deletes nothing when the dialog is closed while the Google popup is open', async () => {
    const popup = Promise.withResolvers<Result<unknown, AuthError>>();

    const { deps, calls, dialog } = setup({
      reauthenticateWithGoogle: () => popup.promise,
    });

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    const showToast = vi.spyOn(fakeToaster, 'show');

    onTestFinished(() => {
      showToast.mockRestore();
    });

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    assert.isTrue(store.state.getSnapshot().value.isWaitingResponse);

    dialog.closeDialog();

    popup.resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, ['reauthenticateWithGooglePopup alice']);

    assert.isFalse(store.state.getSnapshot().value.isWaitingResponse);

    assert.deepStrictEqual(showToast.mock.calls, []);
  });

  test('starts no second submit while the first is waiting', async () => {
    const popup = Promise.withResolvers<Result<unknown, AuthError>>();

    const { deps, calls, dialog } = setup({
      reauthenticateWithGoogle: () => popup.promise,
    });

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, ['reauthenticateWithGooglePopup alice']);

    popup.resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticateWithGooglePopup alice',
      'deleteUser alice',
    ]);
  });

  test('a submit from before a reopen leaves the new one waiting', async () => {
    const popups = [
      Promise.withResolvers<Result<unknown, AuthError>>(),
      Promise.withResolvers<Result<unknown, AuthError>>(),
    ] as const;

    const { deps, calls, dialog } = setup({
      reauthenticateWithGoogle: () => {
        const popup = popups.at(
          calls.filter((call) => call === 'reauthenticateWithGooglePopup alice')
            .length - 1,
        );

        assert.isDefined(popup);

        return popup.promise;
      },
    });

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    const showToast = vi.spyOn(fakeToaster, 'show');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    onTestFinished(() => {
      showToast.mockRestore();

      consoleError.mockRestore();
    });

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    dialog.closeDialog();

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    popups[0].resolve(
      Result.err({ code: 'auth/user-mismatch', message: 'mismatch' }),
    );

    await settle();

    assert.isTrue(store.state.getSnapshot().value.isWaitingResponse);

    assert.deepStrictEqual(showToast.mock.calls, []);

    // Logged, but neither said nor ending the new submit's wait.
    assert.strictEqual(consoleError.mock.calls.length, 1);

    popups[1].resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticateWithGooglePopup alice',
      'reauthenticateWithGooglePopup alice',
      'deleteUser alice',
    ]);

    assert.isFalse(store.state.getSnapshot().value.isWaitingResponse);
  });

  test('stops quietly at a rejection after the dialog was closed', async () => {
    const popup = Promise.withResolvers<Result<unknown, AuthError>>();

    const { deps, calls, dialog } = setup({
      reauthenticateWithGoogle: () => popup.promise,
    });

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    const showToast = vi.spyOn(fakeToaster, 'show');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    onTestFinished(() => {
      showToast.mockRestore();

      consoleError.mockRestore();
    });

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    dialog.closeDialog();

    popup.reject(new Error('network'));

    await settle();

    assert.deepStrictEqual(calls, ['reauthenticateWithGooglePopup alice']);

    assert.isFalse(store.state.getSnapshot().value.isWaitingResponse);

    assert.deepStrictEqual(showToast.mock.calls, []);

    assert.strictEqual(consoleError.mock.calls.length, 1);
  });

  test("ends the wait and reports a rejection as the step's error", async () => {
    const { deps, calls, dialog } = setup({
      reauthenticateWithGoogle: () => Promise.reject(new Error('network')),
    });

    const store = createDeleteAccountCreatedWithGoogleStore(deps);

    const showToast = vi.spyOn(fakeToaster, 'show');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    onTestFinished(() => {
      showToast.mockRestore();

      consoleError.mockRestore();
    });

    dialog.deleteAccountCreatedWithGoogle();

    store.inputEmailHandler('alice@example.com');

    store.enterClickHandler();

    await settle();

    assert.deepStrictEqual(calls, ['reauthenticateWithGooglePopup alice']);

    assert.isFalse(store.state.getSnapshot().value.isWaitingResponse);

    // As when re-authenticating returns an error: the dialog stays open.
    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'deleteAccountCreatedWithGoogle',
    );

    assert.deepStrictEqual(
      showToast.mock.calls.map(([props]) => [props.intent, props.message]),
      [['danger', constant(dict.accountSettings.reauthenticate.message.error)]],
    );

    assert.strictEqual(consoleError.mock.calls.length, 1);
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

  test('closes no other dialog when this one was closed while saving', async () => {
    const update = Promise.withResolvers<Result<undefined, AuthError>>();

    const { deps, calls, dialog } = setup({
      respond: { 'update.displayName': () => update.promise },
    });

    const store = createUpdateDisplayNamePageStore(deps);

    const reports = watchReports();

    dialog.changeUsername();

    store.inputDisplayNameHandler('alicia');

    store.enterClickHandler();

    await settle();

    assert.isTrue(store.state.getSnapshot().value.formState.isWaitingResponse);

    dialog.closeDialog();

    dialog.changePassword();

    update.resolve(Result.ok(undefined));

    await settle();

    // The name did change, so the user is read again and the toast says so.
    assert.deepStrictEqual(calls, [
      'update.displayName alice alicia',
      'emitAuthStateChange',
    ]);

    assert.strictEqual(
      dialog.openingDialogType$.getSnapshot().value,
      'updatePassword',
    );

    assert.deepStrictEqual(reports.toasts(), [
      [
        'success',
        constant(dict.accountSettings.updateDisplayName.message.success),
      ],
    ]);
  });

  test("ends the wait and reports a rejection as the step's error", async () => {
    const { deps, dialog } = setup({
      respond: {
        'update.displayName': () => Promise.reject(new Error('network')),
      },
    });

    const store = createUpdateDisplayNamePageStore(deps);

    const reports = watchReports();

    dialog.changeUsername();

    store.inputDisplayNameHandler('alicia');

    store.enterClickHandler();

    await settle();

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), [
      [
        'danger',
        constant(dict.accountSettings.updateDisplayName.message.error),
      ],
    ]);

    assert.strictEqual(reports.errors(), 1);
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

  test('changes nothing when the dialog is closed while signing in again', async () => {
    const reauth = Promise.withResolvers<Result<unknown, AuthError>>();

    const { deps, calls, dialog } = setup({
      reauthenticate: () => reauth.promise,
    });

    const store = createUpdateEmailPageStore(deps);

    const reports = watchReports();

    dialog.changeEmail();

    store.inputEmailHandler('alicia@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.isTrue(store.state.getSnapshot().value.formState.isWaitingResponse);

    dialog.closeDialog();

    reauth.resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
    ]);

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), []);
  });

  test("ends the wait and reports a rejection as the step's error", async () => {
    const { deps, dialog } = setup({
      respond: { 'update.email': () => Promise.reject(new Error('network')) },
    });

    const store = createUpdateEmailPageStore(deps);

    const reports = watchReports();

    dialog.changeEmail();

    store.inputEmailHandler('alicia@example.com');

    store.inputPasswordHandler('password123');

    store.enterClickHandler();

    await settle();

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), [
      ['danger', constant(dict.accountSettings.updateEmail.message.error)],
    ]);

    assert.strictEqual(reports.errors(), 1);
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

  test('changes nothing when the dialog is closed while signing in again', async () => {
    const reauth = Promise.withResolvers<Result<unknown, AuthError>>();

    const { deps, calls, dialog } = setup({
      reauthenticate: () => reauth.promise,
    });

    const store = createUpdatePasswordPageStore(deps);

    const reports = watchReports();

    dialog.changePassword();

    store.inputOldPasswordHandler('password123');

    store.inputNewPasswordHandler('password456');

    store.inputNewPasswordConfirmationHandler('password456');

    store.enterClickHandler();

    await settle();

    assert.isTrue(store.state.getSnapshot().value.formState.isWaitingResponse);

    dialog.closeDialog();

    reauth.resolve(Result.ok(undefined));

    await settle();

    assert.deepStrictEqual(calls, [
      'reauthenticate alice cred(alice@example.com,password123)',
    ]);

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), []);
  });

  test("ends the wait and reports a rejection as the step's error", async () => {
    const { deps, dialog } = setup({
      respond: {
        'update.password': () => Promise.reject(new Error('network')),
      },
    });

    const store = createUpdatePasswordPageStore(deps);

    const reports = watchReports();

    dialog.changePassword();

    store.inputOldPasswordHandler('password123');

    store.inputNewPasswordHandler('password456');

    store.inputNewPasswordConfirmationHandler('password456');

    store.enterClickHandler();

    await settle();

    assert.isFalse(store.state.getSnapshot().value.formState.isWaitingResponse);

    assert.deepStrictEqual(reports.toasts(), [
      ['danger', constant(dict.accountSettings.updatePassword.message.error)],
    ]);

    assert.strictEqual(reports.errors(), 1);
  });
});

describe('a rejecting re-authentication in the email and password dialogs', () => {
  test.each([
    {
      name: 'email',
      run: (deps: Setup['deps']) => {
        const store = createUpdateEmailPageStore(deps);

        deps.dialog.changeEmail();

        store.inputEmailHandler('alicia@example.com');

        store.inputPasswordHandler('password123');

        store.enterClickHandler();

        return () =>
          store.state.getSnapshot().value.formState.isWaitingResponse;
      },
    },
    {
      name: 'password',
      run: (deps: Setup['deps']) => {
        const store = createUpdatePasswordPageStore(deps);

        deps.dialog.changePassword();

        store.inputOldPasswordHandler('password123');

        store.inputNewPasswordHandler('password456');

        store.inputNewPasswordConfirmationHandler('password456');

        store.enterClickHandler();

        return () =>
          store.state.getSnapshot().value.formState.isWaitingResponse;
      },
    },
  ] as const)(
    'the $name dialog changes nothing, ends the wait and says signing in again failed',
    async ({ run }) => {
      const { deps, calls, dialog } = setup({
        reauthenticate: () => Promise.reject(new Error('network')),
      });

      const reports = watchReports();

      const isWaitingResponse = run(deps);

      await settle();

      assert.deepStrictEqual(calls, [
        'reauthenticate alice cred(alice@example.com,password123)',
      ]);

      assert.isFalse(isWaitingResponse());

      // As for an error with no code it knows: the dialog closes.
      assert.isUndefined(dialog.openingDialogType$.getSnapshot().value);

      assert.deepStrictEqual(reports.toasts(), [
        ['danger', constant(dict.accountSettings.reauthenticate.message.error)],
      ]);

      assert.strictEqual(reports.errors(), 1);
    },
  );
});

type FakeUser = AccountUser & Readonly<{ name: string }>;

const alice: FakeUser = {
  name: 'alice',
  email: 'alice@example.com',
  displayName: 'alice',
} as const;

type UpdateCall =
  'deleteUser' | 'update.displayName' | 'update.email' | 'update.password';

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
    reauthenticate?:
      Result<unknown, AuthError> | (() => Promise<Result<unknown, AuthError>>);
    reauthenticateWithGoogle?:
      Result<unknown, AuthError> | (() => Promise<Result<unknown, AuthError>>);
    /** What a call other than signing in again answers, by its name. */
    respond?: Readonly<
      Partial<
        ReadonlyRecord<UpdateCall, () => Promise<Result<undefined, AuthError>>>
      >
    >;
  }>,
): Setup => {
  const user = options?.signedIn === false ? undefined : alice;

  const [fireAuthUser$] = createState<FakeUser | undefined>(user);

  const dialog = createUpdateUserInfoDialogStore();

  const mut_calls: string[] = [];

  const ok = (
    name: UpdateCall,
    call: string,
  ): Promise<Result<undefined, AuthError>> => {
    mut_calls.push(call);

    return (
      options?.respond?.[name]?.() ?? Promise.resolve(Result.ok(undefined))
    );
  };

  return {
    deps: {
      api: {
        auth: {
          emailCredential: (email, password) => `cred(${email},${password})`,
          reauthenticateWithGooglePopup: (u) => {
            mut_calls.push(`reauthenticateWithGooglePopup ${u.name}`);

            const reauth = options?.reauthenticateWithGoogle;

            return typeof reauth === 'function'
              ? reauth()
              : Promise.resolve(reauth ?? Result.ok(undefined));
          },
          reauthenticateWithCredential: (u, credential) => {
            mut_calls.push(`reauthenticate ${u.name} ${credential}`);

            const reauth = options?.reauthenticate;

            return typeof reauth === 'function'
              ? reauth()
              : Promise.resolve(reauth ?? Result.ok(undefined));
          },
          deleteUser: (u) => ok('deleteUser', `deleteUser ${u.name}`),
          update: {
            displayName: (u, displayName) =>
              ok(
                'update.displayName',
                `update.displayName ${u.name} ${displayName}`,
              ),
            email: (u, email) =>
              ok('update.email', `update.email ${u.name} ${email}`),
            password: (u, password) =>
              ok('update.password', `update.password ${u.name} ${password}`),
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

/** Records the toasts shown and the errors logged until the test ends. */
const watchReports = (): Readonly<{
  toasts: () => readonly (readonly unknown[])[];
  errors: () => number;
}> => {
  const showToast = vi.spyOn(fakeToaster, 'show');

  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  onTestFinished(() => {
    showToast.mockRestore();

    consoleError.mockRestore();
  });

  return {
    toasts: () =>
      showToast.mock.calls.map(([props]) => [props.intent, props.message]),
    errors: () => consoleError.mock.calls.length,
  } as const;
};
