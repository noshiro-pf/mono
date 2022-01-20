import type { Intent } from '@blueprintjs/core';
import { useAsyncReducer, useToggleState } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { createUser, sendEmailVerification, setDisplayName } from '../../api';
import { dict, routes } from '../../constants';
import type { RegisterPageState } from '../../functions';
import {
  registerPageHasError,
  registerPageInitialState,
  registerPageStateReducer,
} from '../../functions';
import { router } from '../../store';

export const useRegisterPageState = (): DeepReadonly<{
  state: RegisterPageState;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  inputUsernameHandler: (value: string) => void;
  inputPasswordConfirmationHandler: (value: string) => void;
  usernameFormIntent: Intent;
  emailFormIntent: Intent;
  passwordFormIntent: Intent;
  passwordIsOpen: boolean;
  togglePasswordLock: () => void;
  enterButtonDisabled: boolean;
}> => {
  const [state, dispatch] = useAsyncReducer(
    registerPageStateReducer,
    registerPageInitialState
  );

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterButtonDisabled: boolean = useMemo(
    () => state.isWaitingResponse || registerPageHasError(state),
    [state]
  );

  const enterClickHandler = useCallback(async (): Promise<void> => {
    if (enterButtonDisabled) return;

    const s = await dispatch({ type: 'submit' });

    if (registerPageHasError(s)) return;

    const createUserResult = await createUser(
      s.email.inputValue,
      s.password.password.inputValue
    );

    if (Result.isErr(createUserResult)) {
      switch (createUserResult.value.code) {
        case 'auth/invalid-email':
          await dispatch({
            type: 'setEmailError',
            payload: dict.register.error.invalidEmail,
          });
          return;

        case 'auth/email-already-in-use':
          await dispatch({
            type: 'setEmailError',
            payload: dict.register.error.emailAlreadyInUse,
          });
          return;

        case 'auth/weak-password':
          await dispatch({
            type: 'setPasswordError',
            payload: dict.register.error.weakPassword,
          });
          return;

        default:
          console.error(createUserResult.value);
          await dispatch({
            type: 'setOtherError',
            payload: createUserResult.value.message,
          });
          return;
      }
    }

    const user = createUserResult.value.user;

    const [updateProfileResult] = await Promise.all([
      setDisplayName(user, s.username.inputValue),
      sendEmailVerification(user),
    ]);

    if (Result.isErr(updateProfileResult)) {
      console.error(updateProfileResult.value);
      await dispatch({
        type: 'setUsernameError',
        payload: updateProfileResult.value.message,
      });
      return;
    }

    await dispatch({ type: 'done' });

    if (pageToBack !== undefined) {
      router.redirect(pageToBack);
    } else {
      router.redirect(routes.createPage);
    }
  }, [enterButtonDisabled, pageToBack, dispatch]);

  const inputUsernameHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputUsername',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

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

  const inputPasswordConfirmationHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputPasswordConfirmation',
        payload: value,
      }).catch(console.error);
    },
    [dispatch]
  );

  const usernameFormIntent: Intent =
    state.username.error === undefined ? 'primary' : 'danger';

  const emailFormIntent: Intent =
    state.email.error === undefined ? 'primary' : 'danger';

  const passwordFormIntent: Intent =
    state.password.password.error === undefined &&
    state.password.passwordConfirmation.error === undefined
      ? 'primary'
      : 'danger';

  const [passwordIsOpen, togglePasswordLock] = useToggleState(false);

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
    inputUsernameHandler,
    inputPasswordConfirmationHandler,
    usernameFormIntent,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    togglePasswordLock,
    enterButtonDisabled,
  };
};
