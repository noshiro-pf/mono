import type { Toaster } from '@blueprintjs/core';
import { type InitializedObservable, combine, filter, map } from 'synstate';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  type DeleteAccountPageState,
  deleteAccountPageHasError,
  deleteAccountPageInitialState,
  deleteAccountPageStateReducer,
  showToast,
} from '../../functions/index.mjs';
import {
  createReducerWithActions,
  createToggleState,
} from '../../utils/index.mjs';
import type {
  AccountAuth,
  AccountAuthApi,
  AccountUser,
} from './account-deps.mjs';
import type { UpdateUserInfoDialog } from './update-user-info-dialog-state.mjs';

export type DeleteAccountPageDeps<User, ReauthCredential> = Readonly<{
  api: Readonly<{
    auth: StrictPick<
      AccountAuthApi<User, ReauthCredential>,
      'deleteUser' | 'emailCredential' | 'reauthenticateWithCredential'
    >;
  }>;
  auth: StrictPick<AccountAuth<User>, 'getFireAuthUserSnapshot'>;
  /** Which dialog is open; this one closes itself when done. */
  dialog: StrictPick<
    UpdateUserInfoDialog,
    'closeDialog' | 'openingDialogType$'
  >;
  /** Where the dialog says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The dialog that deletes an account made with an email and a password:
 * the form, signing in again, and deleting the user.
 */
export const createDeleteAccountPageStore = <
  User extends AccountUser,
  ReauthCredential,
>(
  deps: DeleteAccountPageDeps<User, ReauthCredential>,
): DeleteAccountPage => {
  const dc = dict.accountSettings;

  const dialogClosed$ = deps.dialog.openingDialogType$.pipe(
    filter((openingDialog) => openingDialog === undefined),
  );

  const [, dispatch, { state: formState$ }] = createReducerWithActions(
    deleteAccountPageStateReducer,
    deleteAccountPageInitialState,
    [dialogClosed$.pipe(map(() => ({ type: 'reset' }) as const))],
  );

  const enterButtonDisabled$ = formState$.pipe(
    map((st) => st.isWaitingResponse || deleteAccountPageHasError(st)),
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
  );

  const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
  );

  const { state: passwordIsOpenState$, toggle: togglePasswordLock } =
    createToggleState([dialogClosed$]);

  const state = combine([
    formState$,
    enterButtonDisabled$,
    emailFormIntent$,
    passwordFormIntent$,
    passwordIsOpenState$,
  ]).pipe(
    map(
      ([
        formState,
        enterButtonDisabled,
        emailFormIntent,
        passwordFormIntent,
        passwordIsOpen,
      ]) => ({
        formState,
        enterButtonDisabled,
        emailFormIntent,
        passwordFormIntent,
        passwordIsOpen,
      }),
    ),
  );

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (deleteAccountPageHasError(s)) {
      return;
    }

    const credential: ReauthCredential = deps.api.auth.emailCredential(
      s.email.inputValue,
      s.password.inputValue,
    );

    const res1 = await deps.api.auth.reauthenticateWithCredential(
      user,
      credential,
    );

    if (Result.isErr(res1)) {
      switch (res1.value.code) {
        case 'auth/wrong-password':
          dispatch({
            type: 'setPasswordError',
            payload: dc.reauthenticate.message.wrongPassword,
          });

          break;

        default:
          console.error(
            'error occurred on reauthenticateWithCredential:',
            res1.value.code,
            res1.value.message,
          );

          dispatch({ type: 'done' });

          deps.dialog.closeDialog();

          showToast({
            toast: deps.toast,
            message: dc.reauthenticate.message.error,
            intent: 'danger',
          });

          break;
      }

      return;
    }

    const res2 = await deps.api.auth.deleteUser(user);

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on deleteUser:',
        res2.value.code,
        res2.value.message,
      );

      dispatch({ type: 'done' });

      deps.dialog.closeDialog();

      showToast({
        toast: deps.toast,
        message: dc.deleteAccount.message.error,
        intent: 'danger',
      });

      return;
    }

    dispatch({ type: 'done' });

    deps.dialog.closeDialog();

    showToast({
      toast: deps.toast,
      message: dc.deleteAccount.message.success,
      intent: 'success',
    });
  };

  const enterClickHandler = (): void => {
    const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

    const fireAuthUser = deps.auth.getFireAuthUserSnapshot();

    if (enterButtonDisabled || fireAuthUser === undefined) {
      return;
    }

    // TODO: use toast
    submit(fireAuthUser).catch(console.error);
  };

  const inputEmailHandler = (value: string): void => {
    dispatch({ type: 'inputEmail', payload: value });
  };

  const inputPasswordHandler = (value: string): void => {
    dispatch({ type: 'inputPassword', payload: value });
  };

  return {
    state,
    togglePasswordLock,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
  } as const;
};

export type DeleteAccountPage = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: DeleteAccountPageState;
      enterButtonDisabled: boolean;
      emailFormIntent: Intent;
      passwordFormIntent: Intent;
      passwordIsOpen: boolean;
    }>
  >;
  togglePasswordLock: () => void;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
}>;
