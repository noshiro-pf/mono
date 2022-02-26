import type { Intent } from '@blueprintjs/core';
import type { InitializedObservable } from '@noshiro/syncflow';
import { createBooleanState, createReducer, mapI } from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import { api } from '../../api';
import { dict, routes } from '../../constants';
import {
  createToaster,
  registerPageHasError,
  registerPageInitialState,
  registerPageStateReducer,
  showToast,
} from '../../functions';
import { router } from '../router';

const dc = dict.register;

const toast = createToaster();

export namespace RegisterPageStore {
  export const [state$, dispatch] = createReducer(
    registerPageStateReducer,
    registerPageInitialState
  );

  export const enterButtonDisabled$ = state$.chain(
    mapI((state) => state.isWaitingResponse || registerPageHasError(state))
  );

  export const usernameFormIntent$: InitializedObservable<Intent> =
    state$.chain(
      mapI((state) =>
        state.username.error === undefined ? 'primary' : 'danger'
      )
    );

  export const emailFormIntent$: InitializedObservable<Intent> = state$.chain(
    mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
  );

  export const passwordFormIntent$: InitializedObservable<Intent> =
    state$.chain(
      mapI((state) =>
        state.password.password.error === undefined &&
        state.password.passwordConfirmation.error === undefined
          ? 'primary'
          : 'danger'
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

    if (registerPageHasError(s)) return;

    const createUserResult = await api.auth.createUser(
      s.email.inputValue,
      s.password.password.inputValue
    );

    if (Result.isErr(createUserResult)) {
      switch (createUserResult.value.code) {
        case 'auth/invalid-email':
          dispatch({
            type: 'setEmailError',
            payload: dc.message.error.invalidEmail,
          });
          return;

        case 'auth/email-already-in-use':
          dispatch({
            type: 'setEmailError',
            payload: dc.message.error.emailAlreadyInUse,
          });
          return;

        case 'auth/weak-password':
          dispatch({
            type: 'setPasswordError',
            payload: dc.message.error.weakPassword,
          });

          return;

        default:
          console.error(createUserResult.value);

          dispatch({
            type: 'setOtherError',
            payload: createUserResult.value.message,
          });

          showToast({
            toast,
            message: dc.message.error.unknownErrorOnRegister,
            intent: 'danger',
          });
          return;
      }
    }

    const user = createUserResult.value.user;

    const [updateProfileResult] = await Promise.all([
      api.auth.update.displayName(user, s.username.inputValue),
      api.auth.sendEmailVerification(user),
    ]);

    if (Result.isErr(updateProfileResult)) {
      console.error(updateProfileResult.value);
      dispatch({
        type: 'setUsernameError',
        payload: updateProfileResult.value.message,
      });
      return;
    }

    dispatch({ type: 'done' });

    showToast({
      toast,
      message: dc.message.success.register,
      intent: 'success',
    });

    if (pageToBack !== undefined) {
      router.redirect(pageToBack);
    } else {
      router.redirect(routes.createPage);
    }
  };

  export const inputUsernameHandler = (value: string): void => {
    dispatch({
      type: 'inputUsername',
      payload: value,
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

  export const inputPasswordConfirmationHandler = (value: string): void => {
    dispatch({
      type: 'inputPasswordConfirmation',
      payload: value,
    });
  };

  const resetAllDialogState = (): void => {
    dispatch({ type: 'reset' });
    hidePassword();
  };

  router.isRoute.registerPage$.subscribe((isRegisterPage) => {
    if (!isRegisterPage) {
      resetAllDialogState();
    }
  });
}
