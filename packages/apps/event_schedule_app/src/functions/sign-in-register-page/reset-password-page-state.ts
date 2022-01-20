import { assertType, IRecord } from '@noshiro/ts-utils';
import type { Reducer } from 'react';
import type { EmailInputState } from '../input-state';
import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
} from '../input-state';

export type ResetPasswordPageState = DeepReadonly<{
  email: EmailInputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const resetPasswordPageInitialState = {
  email: emailInputInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const;

assertType<
  TypeExtends<typeof resetPasswordPageInitialState, ResetPasswordPageState>
>();

export const resetPasswordPageHasError = (
  state: ResetPasswordPageState
): boolean =>
  emailInputHasError(state.email) || state.otherErrors !== undefined;

export type ResetPasswordPageStateAction = DeepReadonly<
  | { type: 'done' }
  | { type: 'inputEmail'; payload: string }
  | { type: 'setEmailError'; payload: string }
  | { type: 'setOtherError'; payload: string }
  | { type: 'submit' }
>;

export const resetPasswordPageStateReducer: Reducer<
  ResetPasswordPageState,
  ResetPasswordPageStateAction
> = (state, action) => {
  switch (action.type) {
    case 'inputEmail':
      return IRecord.set(
        state,
        'email',
        emailInputStateReducer(state.email, {
          type: 'input',
          payload: action.payload,
        })
      );

    case 'setEmailError':
      return {
        email: emailInputStateReducer(state.email, {
          type: 'setError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'setOtherError':
      return {
        email: state.email,
        otherErrors: action.payload,
        isWaitingResponse: false,
      };

    case 'submit': {
      const emailNextState = emailInputStateReducer(state.email, {
        type: 'submit',
      });

      return {
        email: emailNextState,
        otherErrors: undefined,
        isWaitingResponse: !emailInputHasError(emailNextState),
      };
    }

    case 'done':
      return IRecord.set(state, 'isWaitingResponse', false);
  }
};
