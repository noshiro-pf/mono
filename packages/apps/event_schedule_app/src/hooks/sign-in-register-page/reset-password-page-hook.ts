import type { Intent } from '@blueprintjs/core';
import { useAsyncReducer } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { sendPasswordResetEmail } from '../../api';
import { dict, routes } from '../../constants';
import type { ResetPasswordPageState } from '../../functions';
import {
  resetPasswordPageHasError,
  resetPasswordPageInitialState,
  resetPasswordPageStateReducer,
} from '../../functions';
import { router } from '../../store';

export const useResetPasswordPageState = (): DeepReadonly<{
  state: ResetPasswordPageState;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  emailFormIntent: Intent;
  enterButtonDisabled: boolean;
}> => {
  const [state, dispatch] = useAsyncReducer(
    resetPasswordPageStateReducer,
    resetPasswordPageInitialState
  );

  const pageToBack = useStreamValue(router.pageToBack$);

  const enterButtonDisabled: boolean = useMemo(
    () => state.isWaitingResponse || resetPasswordPageHasError(state),
    [state]
  );

  const enterClickHandler = useCallback(async (): Promise<void> => {
    if (enterButtonDisabled) return;

    const s = await dispatch({ type: 'submit' });

    if (resetPasswordPageHasError(s)) return;

    const sendPasswordResetEmailResult = await sendPasswordResetEmail(
      s.email.inputValue
    );

    if (Result.isErr(sendPasswordResetEmailResult)) {
      switch (sendPasswordResetEmailResult.value.code) {
        case 'auth/user-not-found':
          await dispatch({
            type: 'setEmailError',
            payload: dict.register.error.userNotFound,
          });
          return;

        default:
          console.error(sendPasswordResetEmailResult.value);
          await dispatch({
            type: 'setOtherError',
            payload: sendPasswordResetEmailResult.value.message,
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

  const emailFormIntent: Intent =
    state.email.error === undefined ? 'primary' : 'danger';

  return {
    state,
    enterClickHandler,
    inputEmailHandler,
    emailFormIntent,
    enterButtonDisabled,
  };
};
