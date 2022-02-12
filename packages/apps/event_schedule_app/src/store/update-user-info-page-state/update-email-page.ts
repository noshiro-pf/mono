import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import {
  createBooleanState,
  createReducer,
  mapI,
  withLatestFromI,
} from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import type { AuthCredential, User } from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { api } from '../../api';
import { dict } from '../../constants';
import {
  createToaster,
  showToast,
  updateEmailPageHasError,
  updateEmailPageInitialState,
  updateEmailPageStateReducer,
} from '../../functions';
import { user$ } from '../auth';
import { UpdateUserInfoDialogState } from './update-user-info-dialog-state';

const dc = dict.accountSettings;

const toast = createToaster();

export namespace UpdateEmailPage {
  export const [state$, dispatch] = createReducer(
    updateEmailPageStateReducer,
    updateEmailPageInitialState
  );

  export const enterButtonDisabled$ = state$.chain(
    mapI((state) => state.isWaitingResponse || updateEmailPageHasError(state))
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
      newEmail: string;
      passwordForCredential: string;
      user: DeepReadonly<User>;
    }>
  ): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (updateEmailPageHasError(s)) return;

    const currentEmail = p.user.email ?? '';

    const credential: DeepReadonly<AuthCredential> =
      EmailAuthProvider.credential(currentEmail, p.passwordForCredential);

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

    const res2 = await api.auth.update.email(p.user, p.newEmail);

    if (Result.isErr(res2)) {
      console.error(
        'some error occurred on updateEmail:',
        res2.value.code,
        res2.value.message
      );

      dispatch({ type: 'done' });

      UpdateUserInfoDialogState.closeDialog();

      showToast({
        toast,
        message: dc.updateEmail.message.error,
        intent: 'danger',
      });
      return;
    }

    dispatch({ type: 'done' });

    UpdateUserInfoDialogState.closeDialog();

    showToast({
      toast,
      message: dc.updateEmail.message.success,
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

  UpdateUserInfoDialogState.openingDialog$
    .chain(withLatestFromI(user$))
    .subscribe(([openingDialog, user]) => {
      if (openingDialog === undefined) {
        resetAllDialogState();
      }
      if (openingDialog === 'updateEmail') {
        dispatch({ type: 'inputEmail', payload: user?.email ?? '' });
      }
    });
}
