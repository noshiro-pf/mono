import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import { createReducer, mapI } from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import { api } from '../../api';
import { dict, routes } from '../../constants';
import {
  createToaster,
  resetPasswordPageHasError,
  resetPasswordPageInitialState,
  resetPasswordPageStateReducer,
  showToast,
} from '../../functions';
import { router } from '../router';

const dc = dict.register;

const toast = createToaster();

export namespace ResetPasswordPageStore {
  export const [state$, dispatch] = createReducer(
    resetPasswordPageStateReducer,
    resetPasswordPageInitialState
  );

  export const enterButtonDisabled$ = state$.chain(
    mapI((state) => state.isWaitingResponse || resetPasswordPageHasError(state))
  );

  export const emailFormIntent$: InitializedObservable<Intent> = state$.chain(
    mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
  );

  export const submit = async (
    pageToBack: string | undefined
  ): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (resetPasswordPageHasError(s)) return;

    const sendPasswordResetEmailResult = await api.auth.sendPasswordResetEmail(
      s.email.inputValue
    );

    if (Result.isErr(sendPasswordResetEmailResult)) {
      switch (sendPasswordResetEmailResult.value.code) {
        case 'auth/user-not-found':
          dispatch({
            type: 'setEmailError',
            payload: dict.register.message.error.userNotFound,
          });
          return;

        default:
          console.error(sendPasswordResetEmailResult.value);
          dispatch({
            type: 'setOtherError',
            payload: sendPasswordResetEmailResult.value.message,
          });

          showToast({
            toast,
            message: dc.message.error.unknownErrorOnSendingResetPasswordEmail,
            intent: 'danger',
          });
          return;
      }
    }

    dispatch({ type: 'done' });

    showToast({
      toast,
      message: dc.message.success.sendPasswordResetEmail,
      intent: 'success',
    });

    if (pageToBack !== undefined) {
      router.redirect(pageToBack);
    } else {
      router.redirect(routes.createPage);
    }
  };

  export const inputEmailHandler = (value: string): void => {
    dispatch({
      type: 'inputEmail',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
  };

  router.isRoute.signInPage$.subscribe((isSignInPage) => {
    if (!isSignInPage) {
      resetAllDialogState();
    }
  });
}
