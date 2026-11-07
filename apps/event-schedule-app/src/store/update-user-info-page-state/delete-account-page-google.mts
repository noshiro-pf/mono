import {
  combine,
  filter,
  type InitializedObservable,
  map,
  mapTo,
} from 'synstate';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { dict } from '../../constants/index.mjs';
import {
  emailInputHasError,
  emailInputInitialState,
  type EmailInputState,
  emailInputStateReducer,
  showToast,
} from '../../functions/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
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

export type DeleteAccountCreatedWithGoogleDeps<User> = Readonly<{
  api: Readonly<{
    auth: StrictPick<
      AccountAuthApi<User, unknown>,
      'deleteUser' | 'reauthenticateWithGooglePopup'
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
 * The dialog that deletes an account made with Google: confirming the email,
 * re-authenticating the user with Google, and deleting the user.
 */
export const createDeleteAccountCreatedWithGoogleStore = <
  User extends AccountUser,
>(
  deps: DeleteAccountCreatedWithGoogleDeps<User>,
): DeleteAccountCreatedWithGoogle => {
  const dc = dict.accountSettings;

  const dialogClosed$ = deps.dialog.openingDialogType$.pipe(
    filter((openingDialog) => openingDialog === undefined),
  );

  const [formState$, dispatch] = createReducerWithActions(
    emailInputStateReducer,
    emailInputInitialState,
    [dialogClosed$.pipe(map(() => ({ type: 'reset' }) as const))],
  );

  const enterButtonDisabled$ = combine([
    formState$,
    deps.auth.fireAuthUser$,
  ]).pipe(
    map(
      ([formState, fireAuthUser]) =>
        formState.inputValue !== fireAuthUser?.email,
    ),
  );

  const [isWaitingResponseState, dispatchIsWaitingResponse] =
    createReducerWithActions(
      (_: boolean, isWaitingResponse: boolean) => isWaitingResponse,
      false,
      [dialogClosed$.pipe(mapTo(false))],
    );

  const setTrueIsWaitingResponse = (): void => {
    dispatchIsWaitingResponse(true);
  };

  const setFalseIsWaitingResponse = (): void => {
    dispatchIsWaitingResponse(false);
  };

  const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.error === undefined ? 'primary' : 'danger')),
  );

  const state = combine([
    formState$,
    enterButtonDisabled$,
    isWaitingResponseState,
    emailFormIntent$,
  ]).pipe(
    map(
      ([
        formState,
        enterButtonDisabled,
        isWaitingResponse,
        emailFormIntent,
      ]) => ({
        formState,
        enterButtonDisabled,
        isWaitingResponse,
        emailFormIntent,
      }),
    ),
  );

  const submit = async (user: User): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (emailInputHasError(s)) {
      return;
    }

    setTrueIsWaitingResponse();

    // A submit whose dialog was closed stops at its next step, so it never asks
    // to delete the user after a close.
    await runSubmitSteps(
      deps.dialog.trackSession,
      (isCurrent) => submitSteps(user, isCurrent),
      setFalseIsWaitingResponse,
    );
  };

  /**
   * The steps of `submit`, each ending its wait as an `Err` when it rejects, so
   * that a rejection is reported as the step's own error is.
   */
  const submitSteps = async (
    user: User,
    isCurrent: () => boolean,
  ): Promise<void> => {
    const res1 = await settleAuthStep(
      deps.api.auth.reauthenticateWithGooglePopup(user),
    );

    const dismissed = Result.isErr(res1) && isPopupDismissed(res1.value);

    if (!dismissed && Result.isErr(res1)) {
      console.error(
        'error occurred on reauthenticateWithGooglePopup:',
        ...describeAuthError(res1.value),
      );
    }

    if (!isCurrent()) {
      return;
    }

    // The dialog stays open so that re-authenticating can be tried again.
    if (Result.isErr(res1)) {
      if (dismissed) {
        return;
      }

      showToast({
        toast: deps.toast,
        message: dc.reauthenticate.message.error,
        intent: 'danger',
      });

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
    const { enterButtonDisabled, isWaitingResponse } =
      state.getSnapshot().value;

    const fireAuthUser = deps.auth.getFireAuthUserSnapshot();

    if (
      enterButtonDisabled ||
      isWaitingResponse ||
      fireAuthUser === undefined
    ) {
      return;
    }

    // `submit` reports the steps' failures; this only logs what reporting threw.
    submit(fireAuthUser).catch(console.error);
  };

  const inputEmailHandler = (value: string): void => {
    dispatch({ type: 'input', payload: value });
  };

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
  } as const;
};

/**
 * The codes Firebase gives a popup the user closed, or one a newer popup
 * replaced: a cancel, not a failure, so nothing is shown or logged.
 */
const POPUP_DISMISSED_CODES: ReadonlySet<string> = new Set<string>([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

export type DeleteAccountCreatedWithGoogle = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: EmailInputState;
      enterButtonDisabled: boolean;
      isWaitingResponse: boolean;
      emailFormIntent: Intent;
    }>
  >;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
}>;

/** Whether `error` is one of {@link POPUP_DISMISSED_CODES}. */
const isPopupDismissed = (error: unknown): boolean => {
  const code = authErrorCodeOf(error);

  return code !== undefined && POPUP_DISMISSED_CODES.has(code);
};
