import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import {
  combineLatestI,
  createBooleanState,
  createReducer,
  mapI,
} from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import type { AuthCredential, User } from 'firebase/auth';
import { api } from '../../api';
import { dict } from '../../constants';
import {
  createToaster,
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  showToast,
} from '../../functions';
import { user$ } from '../auth';
import { UpdateUserInfoDialogState } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace DeleteAccountCreatedWithGoogle {
  const [formState$, dispatch] = createReducer(
    emailInputStateReducer,
    emailInputInitialState
  );

  const enterButtonDisabled$ = combineLatestI([formState$, user$]).chain(
    mapI(([formState, user]) => formState.inputValue !== user?.email)
  );

  const {
    setFalse: setFalseIsWaitingResponse,
    setTrue: setTrueIsWaitingResponse,
    state$: isWaitingResponse$,
  } = createBooleanState(false);

  const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
    mapI((state) => (state.error === undefined ? 'primary' : 'danger'))
  );

  export const state$ = combineLatestI([
    formState$,
    enterButtonDisabled$,
    isWaitingResponse$,
    emailFormIntent$,
  ]).chain(
    mapI(
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
      })
    )
  );

  export const submit = async (user: DeepReadonly<User>): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (emailInputHasError(s)) return;

    setTrueIsWaitingResponse();

    const signInResult = await api.auth.googleSignInWithPopup();

    if (Result.isErr(signInResult)) {
      console.error(
        'error occurred on googleSignInWithPopup:',
        signInResult.value
      );
      return;
    }

    const credential: DeepReadonly<AuthCredential> | undefined =
      signInResult.value;

    if (credential === undefined) return;

    const res1 = await api.auth.reauthenticateWithCredential(user, credential);

    if (Result.isErr(res1)) {
      console.error(
        'error occurred on reauthenticateWithCredential:',
        res1.value.code,
        res1.value.message
      );

      setFalseIsWaitingResponse();
      UpdateUserInfoDialogState.closeDialog();

      showToast({
        toast,
        message: dc.reauthenticate.message.error,
        intent: 'danger',
      });
      return;
    }

    const res2 = await api.auth.deleteUser(user);

    if (Result.isErr(res2)) {
      console.error(
        'error occurred on deleteUser:',
        res2.value.code,
        res2.value.message
      );

      setFalseIsWaitingResponse();
      UpdateUserInfoDialogState.closeDialog();

      showToast({
        toast,
        message: dc.deleteAccount.message.error,
        intent: 'danger',
      });
      return;
    }

    setFalseIsWaitingResponse();
    UpdateUserInfoDialogState.closeDialog();

    showToast({
      toast,
      message: dc.deleteAccount.message.success,
      intent: 'success',
    });
  };

  export const inputEmailHandler = (value: string): void => {
    dispatch({
      type: 'input',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
    setFalseIsWaitingResponse();
  };

  UpdateUserInfoDialogState.openingDialog$.subscribe((openingDialog) => {
    if (openingDialog === undefined) {
      resetAllDialogState();
    }
  });
}
