import type { Intent } from '@blueprintjs/core';
import { useAsyncReducer, useToggleState } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { signIn } from '../../api';
import { dict, routes } from '../../constants';
import type { SignInPageState } from '../../functions';
import {
  signInPageHasError,
  signInPageInitialState,
  signInPageStateReducer,
} from '../../functions';
import { router } from '../../store';

export const useSignInPageState = (): DeepReadonly<{
  state: SignInPageState;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  togglePasswordLock: () => void;
  enterButtonDisabled: boolean;
}> => {
  const [state, dispatch] = useAsyncReducer(
    signInPageStateReducer,
    signInPageInitialState
  );

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterButtonDisabled: boolean = useMemo(
    () => state.isWaitingResponse || signInPageHasError(state),
    [state]
  );

  const enterClickHandler = useCallback(async () => {
    if (enterButtonDisabled) return;

    const s = await dispatch({ type: 'submit' });

    if (signInPageHasError(s)) return;

    const signInResult = await signIn(
      s.email.inputValue,
      s.password.inputValue
    );

    if (Result.isErr(signInResult)) {
      switch (signInResult.value.code) {
        case 'auth/user-not-found':
          await dispatch({
            type: 'setEmailError',
            payload: dict.register.error.userNotFound,
          });
          return;

        case 'auth/wrong-password':
          await dispatch({
            type: 'setPasswordError',
            payload: dict.register.error.wrongPassword,
          });
          return;

        default:
          console.error(signInResult.value);
          await dispatch({
            type: 'setOtherError',
            payload: signInResult.value.message,
          });
          return;
      }
    }

    await dispatch({ type: 'done' });

    if (pageToBack !== undefined) {
      router.redirect(pageToBack);
    } else {
      router.redirect(routes.createPage);
    }
  }, [enterButtonDisabled, pageToBack, dispatch]);

  const inputEmailHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputEmail',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const inputPasswordHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputPassword',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const emailFormIntent: Intent =
    state.email.error === undefined ? 'primary' : 'danger';

  const passwordFormIntent: Intent =
    state.password.error === undefined ? 'primary' : 'danger';

  const [passwordIsOpen, togglePasswordLock] = useToggleState(false);

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    togglePasswordLock,
    enterButtonDisabled,
  };
};
