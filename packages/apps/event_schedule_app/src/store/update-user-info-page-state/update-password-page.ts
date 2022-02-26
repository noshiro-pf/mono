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
  showToast,
  updatePasswordPageHasError,
  updatePasswordPageInitialState,
  updatePasswordPageStateReducer,
} from '../../functions';
import { UpdateUserInfoDialogState } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace UpdatePasswordPage {
  export const [state$, dispatch] = createReducer(
    updatePasswordPageStateReducer,
    updatePasswordPageInitialState
  );

  export const enterButtonDisabled$ = state$.chain(
    mapI(
      (state) => state.isWaitingResponse || updatePasswordPageHasError(state)
    )
  );

  export const oldPasswordFormIntent$: InitializedObservable<Intent> =
    state$.chain(
      mapI((state) =>
        state.oldPassword.error === undefined ? 'primary' : 'danger'
      )
    );

  export const newPasswordFormIntent$: InitializedObservable<Intent> =
    state$.chain(
      mapI((state) =>
        state.newPassword.password.error === undefined &&
        state.newPassword.passwordConfirmation.error === undefined
          ? 'primary'
          : 'danger'
      )
    );

  export const {
    state$: oldPasswordIsOpen$,
    toggle: toggleOldPasswordLock,
    setFalse: hideOldPassword,
  } = createBooleanState(false);

  export const {
    state$: newPasswordIsOpen$,
    toggle: toggleNewPasswordLock,
    setFalse: hideNewPassword,
  } = createBooleanState(false);

  export const submit = async (
    p: DeepReadonly<{
      oldPassword: string;
      newPassword: string;
      user: DeepReadonly<User>;
    }>
  ): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updatePasswordPageHasError(s)) return;

    const currentEmail: string = p.user.email ?? '';

    const credential: DeepReadonly<AuthCredential> =
      EmailAuthProvider.credential(currentEmail, p.oldPassword);

    const res1 = await api.auth.reauthenticateWithCredential(
      p.user,
      credential
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
            'some error occurred on reauthenticateWithCredential:',
            res1.value.code,
            res1.value.message
          );

          dispatch({ type: 'done' });

          UpdateUserInfoDialogState.closeDialog();

          showToast({
            toast,
            message: dc.reauthenticate.message.error,
            intent: 'danger',
          });
          break;
      }
      return;
    }

    const res2 = await api.auth.update.password(p.user, p.newPassword);

    if (Result.isErr(res2)) {
      console.error(
        'some error occurred on updatePassword:',
        res2.value.code,
        res2.value.message
      );

      dispatch({ type: 'done' });

      UpdateUserInfoDialogState.closeDialog();

      showToast({
        toast,
        message: dc.updatePassword.message.error,
        intent: 'danger',
      });
      return;
    }

    dispatch({ type: 'done' });

    UpdateUserInfoDialogState.closeDialog();

    showToast({
      toast,
      message: dc.updatePassword.message.success,
      intent: 'success',
    });
  };

  export const inputOldPasswordHandler = (value: string): void => {
    dispatch({
      type: 'inputOldPassword',
      payload: value,
    });
  };

  export const inputNewPasswordHandler = (value: string): void => {
    dispatch({
      type: 'inputNewPassword',
      payload: value,
    });
  };

  export const inputNewPasswordConfirmationHandler = (value: string): void => {
    dispatch({
      type: 'inputNewPasswordConfirmation',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
    hideOldPassword();
    hideNewPassword();
  };

  UpdateUserInfoDialogState.openingDialog$.subscribe((openingDialog) => {
    if (openingDialog === undefined) {
      resetAllDialogState();
    }
  });
}
