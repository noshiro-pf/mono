import {
  assertType,
  isEmailString,
  isNotUndefined,
  isUndefined,
} from '@noshiro/ts-utils';
import type { Reducer } from 'react';
import { dict } from '../../constants';
import type { SignInPageStateAction } from './sign-in-page-state';

export type RegisterPageState = DeepReadonly<{
  inputValue: {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  };
  error: {
    username: string | undefined;
    email: string | undefined;
    password: string | undefined;
    passwordConfirmation: string | undefined;
    others: string | undefined;
  };
  isWaitingResponse: boolean;
}>;

export const registerPageInitialState = {
  inputValue: {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  },
  error: {
    username: undefined,
    email: undefined,
    password: undefined,
    passwordConfirmation: undefined,
    others: undefined,
  },
  isWaitingResponse: false,
} as const;

assertType<TypeExtends<typeof registerPageInitialState, RegisterPageState>>();

export const registerPageHasError = (state: RegisterPageState): boolean =>
  Object.values(state.error).some(isNotUndefined) ||
  Object.values(state.inputValue).some((s) => s === '');

export type RegisterPageStateAction = DeepReadonly<
  | SignInPageStateAction
  | (
      | {
          type: 'inputPasswordConfirmation';
          payload: string;
        }
      | {
          type: 'inputUsername';
          payload: string;
        }
      | {
          type: 'setUsernameError';
          payload: string;
        }
    )
>;

const emptyError = registerPageInitialState.error;

export const registerPageStateReducer: Reducer<
  RegisterPageState,
  RegisterPageStateAction
> = (state, action) => {
  switch (action.type) {
    case 'clickEnterButton': {
      const hasEmailError = !isEmailString(state.inputValue.email);
      const hasPasswordError =
        state.inputValue.password !== state.inputValue.passwordConfirmation;

      const localErrors: RegisterPageState['error'] = {
        username: undefined,
        email: hasEmailError ? dict.common.error.invalidEmail : undefined,
        password: undefined,
        passwordConfirmation:
          hasPasswordError && !hasEmailError
            ? dict.common.error.passwordNotMatch
            : undefined,
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
          ...state.inputValue,
          email: emailInputValue,
        },
        error: emptyError,
        isWaitingResponse: false,
      };
    }

    case 'inputPassword': {
      const passwordInputValue = action.payload;

      return {
        inputValue: {
          ...state.inputValue,
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

    case 'inputPasswordConfirmation': {
      const passwordInputValue = action.payload;

      return {
        inputValue: {
          ...state.inputValue,
          passwordConfirmation:
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

    case 'inputUsername': {
      const usernameInputValue = action.payload;

      return {
        inputValue: {
          ...state.inputValue,
          username: usernameInputValue,
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

    case 'setUsernameError':
      return {
        inputValue: state.inputValue,
        error: {
          ...state.error,
          username: action.payload,
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
