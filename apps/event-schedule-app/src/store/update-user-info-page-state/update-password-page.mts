import { derive, filter, map, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  credentialErrorOf,
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
import {
  authErrorCodeOf,
  describeAuthError,
  runSubmitSteps,
  settleAuthStep,
} from './auth-step.mjs';
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
    'closeDialog' | 'openingDialogType$' | 'trackSession'
  >;
  /** Where the dialog says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The dialog that changes the user's password: signing in again with the old
 * one, then changing it.
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

  const [formState$, dispatch] = createReducerWithActions(
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

  const state = derive(
    [
      formState$,
      enterButtonDisabled$,
      oldPasswordFormIntent$,
      newPasswordFormIntent$,
      oldPasswordIsOpen$,
      newPasswordIsOpen$,
    ],
    (
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    ) => ({
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    }),
  );

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updatePasswordPageHasError(s)) {
      return;
    }

    // A submit whose dialog was closed stops at its next step, so it never
    // changes the password after a close.
    await runSubmitSteps(
      deps.dialog.trackSession,
      (isCurrent) => submitSteps(user, s, isCurrent),
      () => {
        dispatch({ type: 'done' });
      },
    );
  };

  /**
   * The steps of `submit`, each ending its wait as an `Err` when it rejects, so
   * that a rejection is reported as the step's own error is.
   */
  const submitSteps = async (
    user: User,
    s: UpdatePasswordPageState,
    isCurrent: () => boolean,
  ): Promise<void> => {
    const currentEmail: string = user.email ?? '';

    const credential: ReauthCredential = deps.api.auth.emailCredential(
      currentEmail,
      s.oldPassword.inputValue,
    );

    const res1 = await settleAuthStep(
      deps.api.auth.reauthenticateWithCredential(user, credential),
    );

    if (Result.isErr(res1)) {
      switch (credentialErrorOf(authErrorCodeOf(res1.value))) {
        // The email signed in with is the user's own, so only the password can
        // be wrong.
        case 'wrongPassword':
        case 'wrongEmailOrPassword':
          if (isCurrent()) {
            dispatch({
              type: 'setOldPasswordError',
              payload: dc.reauthenticate.message.wrongPassword,
            });
          }

          break;

        // Signing in again reports an email of no account as
        // `auth/user-mismatch`, not `auth/user-not-found`.
        case 'userNotFound':
        case undefined:
          console.error(
            'error occurred on reauthenticateWithCredential:',
            ...describeAuthError(res1.value),
          );

          if (isCurrent()) {
            deps.dialog.closeDialog();

            showToast({
              toast: deps.toast,
              message: dc.reauthenticate.message.error,
              intent: 'danger',
            });
          }

          break;
      }

      return;
    }

    if (!isCurrent()) {
      return;
    }

    const res2 = await settleAuthStep(
      deps.api.auth.update.password(user, s.newPassword.password.inputValue),
    );

    // The password is changed or not by now, so the toast says which even when
    // the dialog was closed meanwhile; only the dialog it started from is
    // closed.
    if (isCurrent()) {
      deps.dialog.closeDialog();
    }

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on updatePassword:',
        ...describeAuthError(res2.value),
      );

      showToast({
        toast: deps.toast,
        message: dc.updatePassword.message.error,
        intent: 'danger',
      });

      return;
    }

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

    // `submit` reports the steps' failures; this only logs what reporting threw.
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
