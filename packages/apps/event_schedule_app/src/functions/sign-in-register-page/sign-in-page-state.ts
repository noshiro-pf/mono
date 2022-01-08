import {
  assertType,
  isEmailString,
  isNotUndefined,
  isUndefined,
} from '@noshiro/ts-utils';
import type { Reducer } from 'react';
import { dict } from '../../constants';

export type SignInPageState = DeepReadonly<{
  inputValue: {
    email: string;
    password: string;
  };
  error: {
    email: string | undefined;
    password: string | undefined;
    others: string | undefined;
  };
  isWaitingResponse: boolean;
}>;

export const signInPageInitialState = {
  inputValue: {
    email: '',
    password: '',
  },
  error: {
    email: undefined,
    password: undefined,
    others: undefined,
  },
  isWaitingResponse: false,
} as const;

assertType<TypeExtends<typeof signInPageInitialState, SignInPageState>>();

export const signInPageHasError = (state: SignInPageState): boolean =>
  Object.values(state.error).some(isNotUndefined) ||
  Object.values(state.inputValue).some((s) => s === '');

export type SignInPageStateAction = DeepReadonly<
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  | {
      type: 'inputEmail';
      payload: string;
    }
  | {
      type: 'inputPassword';
      payload: string;
    }
  | {
      type: 'setEmailError';
      payload: string;
    }
  | {
      type: 'setPasswordError';
      payload: string;
    }
  | {
      type: 'setOtherError';
      payload: string;
    }
  | {
      type: 'clickEnterButton';
      payload: undefined;
    }
  | { type: 'success' }
>;

const emptyError = signInPageInitialState.error;

export const signInPageStateReducer: Reducer<
  SignInPageState,
  SignInPageStateAction
> = (state, action) => {
  switch (action.type) {
    case 'clickEnterButton': {
      const localErrors: SignInPageState['error'] = {
        email: !isEmailString(state.inputValue.email)
          ? dict.common.error.invalidEmail
          : undefined,
        password: undefined,
        others: undefined,
      };
      return {
        inputValue: state.inputValue,
        error: localErrors,
        isWaitingResponse: Object.values(localErrors).every(isUndefined),
      };
    }

    case 'inputEmail': {
      const emailInputValue = action.payload;

      return {
        inputValue: {
          email: emailInputValue,
          password: state.inputValue.password,
        },
        error: emptyError,
        isWaitingResponse: false,
      };
    }

    case 'inputPassword': {
      const passwordInputValue = action.payload;

      return {
        inputValue: {
          email: state.inputValue.email,
          password:
            // if the last operation is backspace
            Object.values(state.error).some(isNotUndefined) &&
            state.inputValue.password.length ===
              passwordInputValue.length + 1 &&
            state.inputValue.password.slice(0, -1) === passwordInputValue
              ? ''
              : passwordInputValue,
        },
        error: emptyError,
        isWaitingResponse: false,
      };
    }

    case 'setEmailError':
      return {
        inputValue: state.inputValue,
        error: {
          ...state.error,
          email: action.payload,
        },
        isWaitingResponse: false,
      };

    case 'setPasswordError':
      return {
        inputValue: state.inputValue,
        error: {
          ...state.error,
          password: action.payload,
        },
        isWaitingResponse: false,
      };

    case 'setOtherError':
      return {
        inputValue: state.inputValue,
        error: {
          ...state.error,
          others: action.payload,
        },
        isWaitingResponse: false,
      };

    case 'success':
      return {
        ...state,
        isWaitingResponse: false,
      };
  }
};
