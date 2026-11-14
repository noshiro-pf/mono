import {
  derive,
  filter,
  map,
  withCurrentValueFrom,
  type InitializedObservable,
} from 'synstate';
import { isNotUndefined, Optional, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  credentialErrorOf,
  showToast,
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
  type UpdateEmailPageState,
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

export type UpdateEmailPageDeps<User, ReauthCredential> = Readonly<{
  api: Readonly<{
    auth: StrictPick<
      AccountAuthApi<User, ReauthCredential>,
      | 'emailCredential'
      | 'reauthenticateWithCredential'
      | 'verifyBeforeUpdateEmail'
    >;
  }>;
  auth: StrictPick<
    AccountAuth<User>,
    'fireAuthUser$' | 'getFireAuthUserSnapshot'
  >;
  /** Which dialog is open; this one closes itself when done. */
  dialog: StrictPick<
    UpdateUserInfoDialog,
    'closeDialog' | 'openingDialogType$' | 'trackSession'
  >;
  /** Where the dialog says whether it went through. */
  toast: Promise<Toaster>;
}>;

/**
 * The dialog that changes the user's email: signing in again with the password,
 * then sending the new address a link that changes it once opened.
 */
export const createUpdateEmailPageStore = <
  User extends AccountUser,
  ReauthCredential,
>(
  deps: UpdateEmailPageDeps<User, ReauthCredential>,
): UpdateEmailPage => {
  const dc = dict.accountSettings;

  /** Cleared when the dialog closes, and filled in when this one opens. */
  const dialogActions$ = deps.dialog.openingDialogType$
    .pipe(withCurrentValueFrom(deps.auth.fireAuthUser$))
    .pipe(
      map(([openingDialog, user]) => {
        switch (openingDialog) {
          case undefined:
            return { type: 'reset' } as const;

          case 'updateEmail':
            return { type: 'inputEmail', payload: user?.email ?? '' } as const;

          case 'deleteAccount':
          case 'deleteAccountCreatedWithGoogle':
          case 'updateDisplayName':
          case 'updatePassword':
            return undefined;
        }
      }),
    )
    .pipe(filter(isNotUndefined));

  const [formState$, dispatch] = createReducerWithActions(
    updateEmailPageStateReducer,
    updateEmailPageInitialState,
    [dialogActions$],
  );

  const enterButtonDisabled$ = formState$.pipe(
    map((st) => st.isWaitingResponse || updateEmailPageHasError(st)),
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
  );

  const passwordFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.password.error === undefined ? 'primary' : 'danger')),
  );

  const { state: passwordIsOpen$, toggle: togglePasswordLock } =
    createToggleState([
      deps.dialog.openingDialogType$.pipe(
        filter((openingDialog) => openingDialog === undefined),
      ),
    ]);

  const state = derive(
    [
      formState$,
      enterButtonDisabled$,
      emailFormIntent$,
      passwordFormIntent$,
      passwordIsOpen$,
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

    if (updateEmailPageHasError(s)) {
      return;
    }

    // A submit whose dialog was closed stops at its next step, so it never
    // changes the email after a close.
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
    s: UpdateEmailPageState,
    isCurrent: () => boolean,
  ): Promise<void> => {
    const currentEmail: string = user.email ?? '';

    const credential: ReauthCredential = deps.api.auth.emailCredential(
      currentEmail,
      s.password.inputValue,
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
              type: 'setPasswordError',
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

    // The address changes only once the link sent to it is opened, and Auth
    // then reports the user with it; until then the old one is shown.
    const res2 = await settleAuthStep(
      deps.api.auth.verifyBeforeUpdateEmail(user, s.email.inputValue),
    );

    // The link is sent or not by now, so the toast says which even when the
    // dialog was closed meanwhile; only the dialog it started from is closed.
    if (isCurrent()) {
      deps.dialog.closeDialog();
    }

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on verifyBeforeUpdateEmail:',
        ...describeAuthError(res2.value),
      );

      showToast({
        toast: deps.toast,
        message: dc.updateEmail.message.error,
        intent: 'danger',
      });

      return;
    }

    showToast({
      toast: deps.toast,
      message: dc.updateEmail.message.linkSent,
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
    dispatch({ type: 'inputEmail', payload: value });
  };

  const inputPasswordHandler = (value: string): void => {
    dispatch({ type: 'inputPassword', payload: value });
  };

  return {
    togglePasswordLock,
    state,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
  } as const;
};

export type UpdateEmailPage = Readonly<{
  togglePasswordLock: () => void;
  state: InitializedObservable<
    Readonly<{
      formState: UpdateEmailPageState;
      enterButtonDisabled: boolean;
      emailFormIntent: Intent;
      passwordFormIntent: Intent;
      passwordIsOpen: boolean;
    }>
  >;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
}>;
