import { type InitializedObservable, derive, filter, map } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  type DeleteAccountPageState,
  credentialErrorOf,
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
import {
  authErrorCodeOf,
  describeAuthError,
  runSubmitSteps,
  settleAuthStep,
} from './auth-step.mjs';
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
    'closeDialog' | 'openingDialogType$' | 'trackSession'
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

  const [formState$, dispatch] = createReducerWithActions(
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

  const state = derive(
    [
      formState$,
      enterButtonDisabled$,
      emailFormIntent$,
      passwordFormIntent$,
      passwordIsOpenState$,
    ],
    (
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    }),
  );

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (deleteAccountPageHasError(s)) {
      return;
    }

    // A submit whose dialog was closed stops at its next step, so it never asks
    // to delete the user after a close.
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
    s: DeleteAccountPageState,
    isCurrent: () => boolean,
  ): Promise<void> => {
    const credential: ReauthCredential = deps.api.auth.emailCredential(
      s.email.inputValue,
      s.password.inputValue,
    );

    const res1 = await settleAuthStep(
      deps.api.auth.reauthenticateWithCredential(user, credential),
    );

    if (Result.isErr(res1)) {
      switch (credentialErrorOf(authErrorCodeOf(res1.value))) {
        case 'wrongPassword':
          if (isCurrent()) {
            dispatch({
              type: 'setPasswordError',
              payload: dc.reauthenticate.message.wrongPassword,
            });
          }

          break;

        // The email is typed here too, so either of the two may be wrong.
        case 'wrongEmailOrPassword':
          if (isCurrent()) {
            dispatch({
              type: 'setPasswordError',
              payload: dc.reauthenticate.message.wrongEmailOrPassword,
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

    const res2 = await settleAuthStep(deps.api.auth.deleteUser(user));

    // The user is deleted or not by now, so the toast says which even when the
    // dialog was closed meanwhile; only the dialog it started from is closed.
    if (isCurrent()) {
      deps.dialog.closeDialog();
    }

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on deleteUser:',
        ...describeAuthError(res2.value),
      );

      showToast({
        toast: deps.toast,
        message: dc.deleteAccount.message.error,
        intent: 'danger',
      });

      return;
    }

    showToast({
      toast: deps.toast,
      message: dc.deleteAccount.message.success,
      intent: 'success',
    });
  };

  const enterClickHandler = (): void => {
    const enterButtonDisabled = Optional.unwrap(
      enterButtonDisabled$.getSnapshot(),
    );

    const fireAuthUser = deps.auth.getFireAuthUserSnapshot();

    if (enterButtonDisabled || fireAuthUser === undefined) {
      return;
    }

    // `submit` reports the steps' failures; this only logs what reporting threw.
    submit(fireAuthUser).catch(console.error);
  };

  const inputEmailHandler = (value: string): void => {
    const s = dispatch({ type: 'inputEmail', payload: value });

    // That message may be about the email, so changing the email answers it as
    // well as retyping the password does.
    if (s.password.error === dc.reauthenticate.message.wrongEmailOrPassword) {
      dispatch({ type: 'inputPassword', payload: s.password.inputValue });
    }
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
