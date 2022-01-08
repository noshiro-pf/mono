import { useAsyncReducer } from '@noshiro/react-utils';
import type { ReactNode } from 'react';
import { createElement as h, useCallback, useMemo } from 'react';
import { dict } from '../constants';
import type { ConfirmEmailDialogState } from '../functions';
import {
  confirmEmailDialogHasError,
  confirmEmailDialogInitialState,
  confirmEmailDialogStateReducer,
} from '../functions';

export const useConfirmEmailDialogState = (
  onSuccess: () => void,
  back: () => void,
  emailAnswer: string
): DeepReadonly<{
  state: ConfirmEmailDialogState;
  helperText: ReactNode;
  hasError: boolean;
  enterClickHandler: () => void;
  cancelClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
}> => {
  const [state, dispatch] = useAsyncReducer(
    confirmEmailDialogStateReducer,
    confirmEmailDialogInitialState
  );

  const enterClickHandler = useCallback(() => {
    dispatch({
      type: 'clickEnterButton',
      payload: { emailAnswer },
    })
      .then((s) => {
        if (!confirmEmailDialogHasError(s)) {
          onSuccess();
        }
      })
      .catch(console.error);
  }, [emailAnswer, onSuccess, dispatch]);

  const cancelClickHandler = useCallback(() => {
    dispatch({ type: 'clickCancelButton' }).then(back).catch(console.error);
  }, [back, dispatch]);

  const inputEmailHandler = useCallback(
    (value: string) => {
      dispatch({
        type: 'inputEmail',
        payload: { value },
      }).catch(console.error);
    },
    [dispatch]
  );

  const helperText = useMemo(
    () =>
      h('div', undefined, [
        state.showErrorOf.invalidEmailFormat
          ? h(
              'div',
              { key: 'invalidEmailFormat' },
              dict.common.error.invalidEmail
            )
          : undefined,
        state.showErrorOf.emailDoesNotMatch
          ? h(
              'div',
              { key: 'emailDoesNotMatch' },
              dict.answerPage.eventInfo.verifyEmailDialog
                .editButtonConfirmDialogValidationFailedMessage
            )
          : undefined,
      ]),
    [state.showErrorOf]
  );

  const hasError = useMemo(() => confirmEmailDialogHasError(state), [state]);

  return {
    state,
    helperText,
    hasError,
    enterClickHandler,
    cancelClickHandler,
    inputEmailHandler,
  };
};
