import type { InputState, PasswordWithConfirmationState } from '../input-state';
import {
  inputHasError,
  inputInitialState,
  inputStateReducer,
  passwordWithConfirmationHasError,
  passwordWithConfirmationInitialState,
  passwordWithConfirmationStateReducer,
} from '../input-state';

export type UpdatePasswordPageState = DeepReadonly<{
  oldPassword: InputState;
  newPassword: PasswordWithConfirmationState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const updatePasswordPageInitialState = {
  oldPassword: inputInitialState,
  newPassword: passwordWithConfirmationInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const;

assertType<
  TypeExtends<typeof updatePasswordPageInitialState, UpdatePasswordPageState>
>();

export const updatePasswordPageHasError = (
  state: UpdatePasswordPageState
): boolean =>
  inputHasError(state.oldPassword) ||
  passwordWithConfirmationHasError(state.newPassword) ||
  state.otherErrors !== undefined;

export type UpdatePasswordPageStateAction = DeepReadonly<
  | { type: 'done' }
  | { type: 'inputNewPassword'; payload: string }
  | { type: 'inputNewPasswordConfirmation'; payload: string }
  | { type: 'inputOldPassword'; payload: string }
  | { type: 'reset' }
  | { type: 'setNewPasswordConfirmationError'; payload: string }
  | { type: 'setNewPasswordError'; payload: string }
  | { type: 'setOldPasswordError'; payload: string }
  | { type: 'setOtherError'; payload: string }
  | { type: 'submit' }
>;

export const updatePasswordPageStateReducer: Reducer<
  UpdatePasswordPageState,
  UpdatePasswordPageStateAction
> = (state, action) => {
  switch (action.type) {
    case 'inputOldPassword':
      return IRecord.set(
        state,
        'oldPassword',
        inputStateReducer(state.oldPassword, {
          type: 'input',
          payload: action.payload,
        })
      );

    case 'inputNewPassword':
      return IRecord.set(
        state,
        'newPassword',
        passwordWithConfirmationStateReducer(state.newPassword, {
          type: 'inputPassword',
          payload: action.payload,
        })
      );

    case 'inputNewPasswordConfirmation':
      return IRecord.set(
        state,
        'newPassword',
        passwordWithConfirmationStateReducer(state.newPassword, {
          type: 'inputPasswordConfirmation',
          payload: action.payload,
        })
      );

    case 'setOldPasswordError':
      return {
        oldPassword: inputStateReducer(state.oldPassword, {
          type: 'setError',
          payload: action.payload,
        }),
        newPassword: state.newPassword,
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'setNewPasswordError':
      return {
        oldPassword: state.oldPassword,
        newPassword: passwordWithConfirmationStateReducer(state.newPassword, {
          type: 'setPasswordError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'setNewPasswordConfirmationError':
      return {
        oldPassword: state.oldPassword,
        newPassword: passwordWithConfirmationStateReducer(state.newPassword, {
          type: 'setPasswordConfirmationError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

    case 'setOtherError':
      return {
        newPassword: state.newPassword,
        oldPassword: state.oldPassword,
        otherErrors: action.payload,
        isWaitingResponse: false,
      };

    case 'submit': {
      const passwordNextState = passwordWithConfirmationStateReducer(
        state.newPassword,
        {
          type: 'submit',
        }
      );

      return {
        oldPassword: state.oldPassword,
        newPassword: passwordNextState,
        otherErrors: undefined,
        isWaitingResponse:
          !inputHasError(state.oldPassword) &&
          !passwordWithConfirmationHasError(passwordNextState),
      };
    }

    case 'done':
      return IRecord.set(state, 'isWaitingResponse', false);

    case 'reset':
      return updatePasswordPageInitialState;
  }
};
