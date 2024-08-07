import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  inputInitialState,
  passwordWithConfirmationHasError,
  passwordWithConfirmationInitialState,
  passwordWithConfirmationStateReducer,
  type EmailInputState,
  type InputState,
  type PasswordWithConfirmationState,
} from '../input-state';
import { type SignInPageStateAction } from './sign-in-page-state';

export type RegisterPageState = Readonly<{
  username: InputState;
  email: EmailInputState;
  password: PasswordWithConfirmationState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const registerPageInitialState = {
  username: inputInitialState,
  email: emailInputInitialState,
  password: passwordWithConfirmationInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const satisfies RegisterPageState;

export const registerPageHasError = (state: RegisterPageState): boolean =>
  state.username.inputValue === '' ||
  state.username.error !== undefined ||
  emailInputHasError(state.email) ||
  passwordWithConfirmationHasError(state.password) ||
  state.otherErrors !== undefined;

export type RegisterPageStateAction = Readonly<
  | SignInPageStateAction
  | (
      | { type: 'inputPasswordConfirmation'; payload: string }
      | { type: 'inputUsername'; payload: string }
      | { type: 'setUsernameError'; payload: string }
    )
>;

export const registerPageStateReducer: Reducer<
  RegisterPageState,
  RegisterPageStateAction
> = (state, action) => {
  switch (action.type) {
    case 'inputUsername':
      return Obj.set(state, 'username', {
        inputValue: action.payload,
        error: undefined,
      });

    case 'setUsernameError':
      return {
        username: Obj.set(state.username, 'error', action.payload),
        email: state.email,
        password: state.password,
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'inputEmail':
      return Obj.set(
        state,
        'email',
        emailInputStateReducer(state.email, {
          type: 'input',
          payload: action.payload,
        }),
      );

    case 'setEmailError':
      return {
        username: state.username,
        email: emailInputStateReducer(state.email, {
          type: 'setError',
          payload: action.payload,
        }),
        password: state.password,
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'inputPassword':
      return Obj.set(
        state,
        'password',
        passwordWithConfirmationStateReducer(state.password, {
          type: 'inputPassword',
          payload: action.payload,
        }),
      );

    case 'setPasswordError':
      return {
        username: state.username,
        email: state.email,
        password: passwordWithConfirmationStateReducer(state.password, {
          type: 'setPasswordError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'inputPasswordConfirmation':
      return Obj.set(
        state,
        'password',
        passwordWithConfirmationStateReducer(state.password, {
          type: 'inputPasswordConfirmation',
          payload: action.payload,
        }),
      );

    case 'setOtherError':
      return {
        username: state.username,
        email: state.email,
        password: state.password,
        otherErrors: action.payload,
        isWaitingResponse: false,
      };

    case 'submit': {
      const emailNextState = emailInputStateReducer(state.email, {
        type: 'submit',
      });
      const passwordNextState = passwordWithConfirmationStateReducer(
        state.password,
        {
          type: 'submit',
        },
      );

      return {
        username: state.username,
        email: emailNextState,
        password: passwordNextState,
        otherErrors: undefined,
        isWaitingResponse:
          !emailInputHasError(emailNextState) &&
          !passwordWithConfirmationHasError(passwordNextState),
      };
    }

    case 'done':
      return Obj.set(state, 'isWaitingResponse', false);

    case 'reset':
      return registerPageInitialState;
  }
};
