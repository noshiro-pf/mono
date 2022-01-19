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
  hasError: boolean;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  inputPasswordHandler: (value: string) => void;
  showPassword: boolean;
  handleLockClick: () => void;
}> => {
  const [state, dispatch] = useAsyncReducer(
    signInPageStateReducer,
    signInPageInitialState
  );

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterClickHandler = useCallback(() => {
    dispatch({
      type: 'clickEnterButton',
      payload: undefined,
    })
      .then(async (s) => {
        if (signInPageHasError(s)) return undefined;

        const signInResult = await signIn(
          s.inputValue.email,
          s.inputValue.password
        );

        if (Result.isErr(signInResult)) {
          switch (signInResult.value.code) {
            case 'auth/user-not-found':
              return dispatch({
                type: 'setEmailError',
                payload: dict.register.error.userNotFound,
              });
            case 'auth/wrong-password':
              return dispatch({
                type: 'setPasswordError',
                payload: dict.register.error.wrongPassword,
              });
            default:
              return dispatch({
                type: 'setOtherError',
                payload: signInResult.value.message,
              });
          }
        }

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

  const hasError = useMemo(() => signInPageHasError(state), [state]);

  const [showPassword, handleLockClick] = useToggleState(false);

  return {
    state,
    hasError,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
    showPassword,
    handleLockClick,
  };
};
