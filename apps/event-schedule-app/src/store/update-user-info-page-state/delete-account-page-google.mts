import type { Toaster } from '@blueprintjs/core';
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
import type { UpdateUserInfoDialog } from './update-user-info-dialog-state.mjs';

export type DeleteAccountCreatedWithGoogleDeps<User, ReauthCredential> =
  Readonly<{
    api: Readonly<{
      auth: StrictPick<
        AccountAuthApi<User, ReauthCredential>,
        'deleteUser' | 'googleSignInWithPopup' | 'reauthenticateWithCredential'
      >;
    }>;
    auth: StrictPick<
      AccountAuth<User>,
      'fireAuthUser$' | 'getFireAuthUserSnapshot'
    >;
    /** Which dialog is open; this one closes itself when done. */
    dialog: StrictPick<
      UpdateUserInfoDialog,
      'closeDialog' | 'openingDialogType$'
    >;
    /** Where the dialog says whether it went through. */
    toast: Promise<Toaster>;
  }>;

/**
 * The dialog that deletes an account made with Google: confirming the email,
 * signing in with Google again, and deleting the user.
 */
export const createDeleteAccountCreatedWithGoogleStore = <
  User extends AccountUser,
  ReauthCredential,
>(
  deps: DeleteAccountCreatedWithGoogleDeps<User, ReauthCredential>,
): DeleteAccountCreatedWithGoogle => {
  const dc = dict.accountSettings;

  const dialogClosed$ = deps.dialog.openingDialogType$.pipe(
    filter((openingDialog) => openingDialog === undefined),
  );

  const [, dispatch, { state: formState$ }] = createReducerWithActions(
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

  const [, dispatchIsWaitingResponse, { state: isWaitingResponseState }] =
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

    const signInResult = await deps.api.auth.googleSignInWithPopup();

    if (Result.isErr(signInResult)) {
      // TODO: use toast
      console.error(
        'error occurred on googleSignInWithPopup:',
        signInResult.value,
      );

      return;
    }

    const credential: ReauthCredential | undefined = signInResult.value;

    if (credential === undefined) {
      return;
    }

    const res1 = await deps.api.auth.reauthenticateWithCredential(
      user,
      credential,
    );

    if (Result.isErr(res1)) {
      console.error(
        'error occurred on reauthenticateWithCredential:',
        res1.value.code,
        res1.value.message,
      );

      setFalseIsWaitingResponse();

      deps.dialog.closeDialog();

      showToast({
        toast: deps.toast,
        message: dc.reauthenticate.message.error,
        intent: 'danger',
      });

      return;
    }

    const res2 = await deps.api.auth.deleteUser(user);

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on deleteUser:',
        res2.value.code,
        res2.value.message,
      );

      setFalseIsWaitingResponse();

      deps.dialog.closeDialog();

      showToast({
        toast: deps.toast,
        message: dc.deleteAccount.message.error,
        intent: 'danger',
      });

      return;
    }

    setFalseIsWaitingResponse();

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
    dispatch({ type: 'input', payload: value });
  };

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
  } as const;
};

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
