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
import { router, setUser } from '../../store';

export const useRegisterPageState = (): DeepReadonly<{
  state: RegisterPageState;
  hasError: boolean;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  inputUsernameHandler: (value: string) => void;
  inputPasswordConfirmationHandler: (value: string) => void;
  showPassword: boolean;
  handleLockClick: () => void;
}> => {
  const [state, dispatch] = useAsyncReducer(
    registerPageStateReducer,
    registerPageInitialState
  );

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterClickHandler = useCallback(() => {
    dispatch({
      type: 'clickEnterButton',
      payload: undefined,
    })
      .then(async (s) => {
        if (registerPageHasError(s)) return undefined;

        const createUserResult = await createUser(
          s.inputValue.email,
          s.inputValue.password
        );

        if (Result.isErr(createUserResult)) {
          switch (createUserResult.value.code) {
            case 'auth/invalid-email':
              return dispatch({
                type: 'setEmailError',
                payload: dict.register.error.invalidEmail,
              });
            case 'auth/email-already-in-use':
              return dispatch({
                type: 'setEmailError',
                payload: dict.register.error.emailAlreadyExists,
              });
            case 'auth/weak-password':
              return dispatch({
                type: 'setPasswordError',
                payload: dict.register.error.invalidPassword,
              });
            default:
              return dispatch({
                type: 'setOtherError',
                payload: createUserResult.value.message,
              });
          }
        }

        const user = createUserResult.value.user;

        const [updateProfileResult] = await Promise.all([
          setDisplayName(user, s.inputValue.username),
          sendEmailVerification(user),
        ]);

        if (Result.isErr(updateProfileResult)) {
          return dispatch({
            type: 'setUsernameError',
            payload: updateProfileResult.value.message,
          });
        }

        setUser({
          email: s.inputValue.email,
          name: s.inputValue.username,
          id: user.uid,
        });

        const res = dispatch({ type: 'success' });

        if (pageToBack !== undefined) {
          router.redirect(pageToBack);
        } else {
          router.redirect(routes.createPage);
        }

        return res;
      })
      .catch(console.error);
  }, [pageToBack, dispatch]);

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

  const hasError = useMemo(() => registerPageHasError(state), [state]);

  const [showPassword, handleLockClick] = useToggleState(false);

  return {
    state,
    hasError,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
    inputUsernameHandler,
    inputPasswordConfirmationHandler,
    showPassword,
    handleLockClick,
  };
};
