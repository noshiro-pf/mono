import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  inputHasError,
  inputInitialState,
  inputStateReducer,
  type EmailInputState,
  type InputState,
} from '../input-state';

export type UpdateEmailPageState = Readonly<{
  email: EmailInputState;
  password: InputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const updateEmailPageInitialState = {
  email: emailInputInitialState,
  password: inputInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const satisfies UpdateEmailPageState;

export const updateEmailPageHasError = (state: UpdateEmailPageState): boolean =>
  emailInputHasError(state.email) ||
  inputHasError(state.password) ||
  state.otherErrors !== undefined;

export type UpdateEmailPageStateAction = Readonly<
  | { type: 'done' }
  | { type: 'inputEmail'; payload: string }
  | { type: 'inputPassword'; payload: string }
  | { type: 'reset' }
  | { type: 'setEmailError'; payload: string }
  | { type: 'setOtherError'; payload: string }
  | { type: 'setPasswordError'; payload: string }
  | { type: 'submit' }
>;

export const updateEmailPageStateReducer: Reducer<
  UpdateEmailPageState,
  UpdateEmailPageStateAction
> = (state, action) => {
  switch (action.type) {
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
        inputStateReducer(state.password, {
          type: 'input',
          payload: action.payload,
        }),
      );

    case 'setPasswordError':
      return {
        email: state.email,
        password: inputStateReducer(state.password, {
          type: 'setError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'setOtherError':
      return {
        email: state.email,
        password: state.password,
        otherErrors: action.payload,
        isWaitingResponse: false,
      };

    case 'submit': {
      const emailNextState = emailInputStateReducer(state.email, {
        type: 'submit',
      });

      return {
        email: emailNextState,
        password: state.password,
        otherErrors: undefined,
        isWaitingResponse:
          !emailInputHasError(emailNextState) && !inputHasError(state.password),
      };
    }

    case 'done':
      return Obj.set(state, 'isWaitingResponse', false);

    case 'reset':
      return updateEmailPageInitialState;
  }
};
