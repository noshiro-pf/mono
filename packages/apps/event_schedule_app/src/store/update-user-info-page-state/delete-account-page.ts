import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import { createBooleanState, createReducer, mapI } from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import type { AuthCredential, User } from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { api } from '../../api';
import { dict } from '../../constants';
import {
  createToaster,
  deleteAccountPageHasError,
  deleteAccountPageInitialState,
  deleteAccountPageStateReducer,
  showToast,
} from '../../functions';
import { UpdateUserInfoDialogState } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace DeleteAccountPage {
  export const [state$, dispatch] = createReducer(
    deleteAccountPageStateReducer,
    deleteAccountPageInitialState
  );

  export const enterButtonDisabled$ = state$.chain(
    mapI((state) => state.isWaitingResponse || deleteAccountPageHasError(state))
  );

  export const emailFormIntent$: InitializedObservable<Intent> = state$.chain(
    mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
  );

  export const passwordFormIntent$: InitializedObservable<Intent> =
    state$.chain(
      mapI((state) =>
        state.password.error === undefined ? 'primary' : 'danger'
      )
    );

  export const {
    state$: passwordIsOpen$,
    toggle: togglePasswordLock,
    setFalse: hidePassword,
  } = createBooleanState(false);

  export const submit = async (
    p: DeepReadonly<{
      email: string;
      password: string;
      user: DeepReadonly<User>;
      closeDialog: () => void;
    }>
  ): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (deleteAccountPageHasError(s)) return;

    const credential: DeepReadonly<AuthCredential> =
      EmailAuthProvider.credential(p.email, p.password);

    const res1 = await api.auth.reauthenticateWithCredential(
      p.user,
      credential
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
            'some error occurred on reauthenticateWithCredential:',
            res1.value.code,
            res1.value.message
          );

          dispatch({ type: 'done' });

          p.closeDialog();

          showToast({
            toast,
            message: dc.reauthenticate.message.error,
            intent: 'danger',
          });
          break;
      }
      return;
    }

    const res2 = await api.auth.deleteUser(p.user);

    if (Result.isErr(res2)) {
      console.error(
        'some error occurred on deleteUser:',
        res2.value.code,
        res2.value.message
      );

      dispatch({ type: 'done' });

      p.closeDialog();

      showToast({
        toast,
        message: dc.deleteAccount.message.error,
        intent: 'danger',
      });
      return;
    }

    dispatch({ type: 'done' });

    p.closeDialog();

    showToast({
      toast,
      message: dc.deleteAccount.message.success,
      intent: 'success',
    });
  };

  export const inputEmailHandler = (value: string): void => {
    dispatch({
      type: 'inputEmail',
      payload: value,
    });
  };

  export const inputPasswordHandler = (value: string): void => {
    dispatch({
      type: 'inputPassword',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
    hidePassword();
  };

  UpdateUserInfoDialogState.openingDialog$.subscribe((openingDialog) => {
    if (openingDialog === undefined) {
      resetAllDialogState();
    }
  });
}
