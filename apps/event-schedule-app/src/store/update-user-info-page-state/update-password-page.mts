import type { Toaster } from '@blueprintjs/core';
import { combine, filter, map, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  showToast,
  updatePasswordPageHasError,
  updatePasswordPageInitialState,
  updatePasswordPageStateReducer,
  type UpdatePasswordPageState,
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

export type UpdatePasswordPageDeps<User, ReauthCredential> = Readonly<{
  api: Readonly<{
    auth: StrictPick<
      AccountAuthApi<User, ReauthCredential>,
      'emailCredential' | 'reauthenticateWithCredential' | 'update'
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
 * The dialog that changes the user's password: signing in again with the
 * old one, then changing it.
 */
export const createUpdatePasswordPageStore = <
  User extends AccountUser,
  ReauthCredential,
>(
  deps: UpdatePasswordPageDeps<User, ReauthCredential>,
): UpdatePasswordPage => {
  const dc = dict.accountSettings;

  const dialogClosed$ = deps.dialog.openingDialogType$.pipe(
    filter((openingDialog) => openingDialog === undefined),
  );

  const [, dispatch, { state: formState$ }] = createReducerWithActions(
    updatePasswordPageStateReducer,
    updatePasswordPageInitialState,
    [dialogClosed$.pipe(map(() => ({ type: 'reset' }) as const))],
  );

  const enterButtonDisabled$ = formState$.pipe(
    map((st) => st.isWaitingResponse || updatePasswordPageHasError(st)),
  );

  const oldPasswordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.oldPassword.error === undefined ? 'primary' : 'danger')),
  );

  const newPasswordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) =>
      st.newPassword.password.error === undefined &&
      st.newPassword.passwordConfirmation.error === undefined
        ? 'primary'
        : 'danger',
    ),
  );

  const { state: oldPasswordIsOpen$, toggle: toggleOldPasswordLock } =
    createToggleState([dialogClosed$]);

  const { state: newPasswordIsOpen$, toggle: toggleNewPasswordLock } =
    createToggleState([dialogClosed$]);

  const state = combine([
    formState$,
    enterButtonDisabled$,
    oldPasswordFormIntent$,
    newPasswordFormIntent$,
    oldPasswordIsOpen$,
    newPasswordIsOpen$,
  ]).pipe(
    map(
      ([
        formState,
        enterButtonDisabled,
        oldPasswordFormIntent,
        newPasswordFormIntent,
        oldPasswordIsOpen,
        newPasswordIsOpen,
      ]) => ({
        formState,
        enterButtonDisabled,
        oldPasswordFormIntent,
        newPasswordFormIntent,
        oldPasswordIsOpen,
        newPasswordIsOpen,
      }),
    ),
  );

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updatePasswordPageHasError(s)) {
      return;
    }

    const currentEmail: string = user.email ?? '';

    const credential: ReauthCredential = deps.api.auth.emailCredential(
      currentEmail,
      s.oldPassword.inputValue,
    );

    const res1 = await deps.api.auth.reauthenticateWithCredential(
      user,
      credential,
    );

    if (Result.isErr(res1)) {
      switch (res1.value.code) {
        case 'auth/wrong-password':
          dispatch({
            type: 'setOldPasswordError',
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

    const res2 = await deps.api.auth.update.password(
      user,
      s.newPassword.password.inputValue,
    );

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on updatePassword:',
        res2.value.code,
        res2.value.message,
      );

      dispatch({ type: 'done' });

      deps.dialog.closeDialog();

      showToast({
        toast: deps.toast,
        message: dc.updatePassword.message.error,
        intent: 'danger',
      });

      return;
    }

    dispatch({ type: 'done' });

    deps.dialog.closeDialog();

    showToast({
      toast: deps.toast,
      message: dc.updatePassword.message.success,
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

  const inputOldPasswordHandler = (value: string): void => {
    dispatch({ type: 'inputOldPassword', payload: value });
  };

  const inputNewPasswordHandler = (value: string): void => {
    dispatch({ type: 'inputNewPassword', payload: value });
  };

  const inputNewPasswordConfirmationHandler = (value: string): void => {
    dispatch({ type: 'inputNewPasswordConfirmation', payload: value });
  };

  return {
    state,
    toggleOldPasswordLock,
    inputOldPasswordHandler,
    inputNewPasswordHandler,
    toggleNewPasswordLock,
    inputNewPasswordConfirmationHandler,
    enterClickHandler,
  } as const;
};

export type UpdatePasswordPage = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: UpdatePasswordPageState;
      enterButtonDisabled: boolean;
      oldPasswordFormIntent: Intent;
      newPasswordFormIntent: Intent;
      oldPasswordIsOpen: boolean;
      newPasswordIsOpen: boolean;
    }>
  >;
  toggleOldPasswordLock: () => void;
  inputOldPasswordHandler: (value: string) => void;
  inputNewPasswordHandler: (value: string) => void;
  toggleNewPasswordLock: () => void;
  inputNewPasswordConfirmationHandler: (value: string) => void;
  enterClickHandler: () => void;
}>;
