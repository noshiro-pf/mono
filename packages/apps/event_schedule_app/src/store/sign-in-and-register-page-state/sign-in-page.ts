import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import { createBooleanState, createReducer, mapI } from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import { api } from '../../api';
import { dict, routes } from '../../constants';
import {
  createToaster,
  showToast,
  signInPageHasError,
  signInPageInitialState,
  signInPageStateReducer,
} from '../../functions';
import { router } from '../router';

const dc = dict.register;

const toast = createToaster();

export namespace SignInPageStore {
  export const [state$, dispatch] = createReducer(
    signInPageStateReducer,
    signInPageInitialState
  );

  export const enterButtonDisabled$ = state$.chain(
    mapI((state) => state.isWaitingResponse || signInPageHasError(state))
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
    pageToBack: string | undefined
  ): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (signInPageHasError(s)) return;

    const signInResult = await api.auth.signIn(
      s.email.inputValue,
      s.password.inputValue
    );

    if (Result.isErr(signInResult)) {
      switch (signInResult.value.code) {
        case 'auth/user-not-found':
          dispatch({
            type: 'setEmailError',
            payload: dict.register.message.error.userNotFound,
          });
          return;

        case 'auth/wrong-password':
          dispatch({
            type: 'setPasswordError',
            payload: dict.register.message.error.wrongPassword,
          });
          return;

        default:
          console.error(signInResult.value);

          dispatch({
            type: 'setOtherError',
            payload: signInResult.value.message,
          });

          showToast({
            toast,
            message: dc.message.error.unknownErrorOnSignIn,
            intent: 'danger',
          });
          return;
      }
    }

    dispatch({ type: 'done' });

    showToast({
      toast,
      message: dc.message.success.signIn,
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

  export const inputPasswordHandler = (value: string): void => {
    dispatch({
      type: 'inputPassword',
      payload: value,
    });
  };

  const resetAllState = (): void => {
    dispatch({ type: 'reset' });
    hidePassword();
  };

  router.isRoute.signInPage$.subscribe((isSignInPage) => {
    if (!isSignInPage) {
      resetAllState();
    }
  });
}
