import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  type EmailInputState,
} from '../input-state';

export type ResetPasswordPageState = Readonly<{
  email: EmailInputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const resetPasswordPageInitialState = {
  email: emailInputInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const satisfies ResetPasswordPageState;

export const resetPasswordPageHasError = (
  state: ResetPasswordPageState
): boolean =>
  emailInputHasError(state.email) || state.otherErrors !== undefined;

export type ResetPasswordPageStateAction = Readonly<
  | { type: 'done' }
  | { type: 'inputEmail'; payload: string }
  | { type: 'reset' }
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
      return Obj.set(
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
      return Obj.set(state, 'isWaitingResponse', false);

    case 'reset':
      return resetPasswordPageInitialState;
  }
};
