import { assertType, IRecord } from '@noshiro/ts-utils';
import type { Reducer } from 'react';
import type { InputState } from '../input-state';
import {
  inputHasError,
  inputInitialState,
  inputStateReducer,
} from '../input-state';

export type UpdatePasswordPageState = DeepReadonly<{
  oldPassword: InputState;
  newPassword: InputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const updatePasswordPageInitialState = {
  oldPassword: inputInitialState,
  newPassword: inputInitialState,
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
  inputHasError(state.newPassword) ||
  state.otherErrors !== undefined;

export type UpdatePasswordPageStateAction = DeepReadonly<
  | { type: 'done' }
  | { type: 'inputNewPassword'; payload: string }
  | { type: 'inputOldPassword'; payload: string }
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
    case 'inputNewPassword':
      return IRecord.set(
        state,
        'newPassword',
        inputStateReducer(state.newPassword, {
          type: 'input',
          payload: action.payload,
        })
      );

    case 'inputOldPassword':
      return IRecord.set(
        state,
        'oldPassword',
        inputStateReducer(state.newPassword, {
          type: 'input',
          payload: action.payload,
        })
      );

    case 'setNewPasswordError':
      return {
        oldPassword: state.oldPassword,
        newPassword: inputStateReducer(state.newPassword, {
          type: 'setError',
          payload: action.payload,
        }),
        otherErrors: state.otherErrors,
        isWaitingResponse: false,
      };

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

    case 'setOtherError':
      return {
        newPassword: state.newPassword,
        oldPassword: state.oldPassword,
        otherErrors: action.payload,
        isWaitingResponse: false,
      };

    case 'submit':
      return {
        newPassword: state.newPassword,
        oldPassword: state.oldPassword,
        otherErrors: undefined,
        isWaitingResponse:
          !inputHasError(state.newPassword) &&
          !inputHasError(state.oldPassword),
      };

    case 'done':
      return IRecord.set(state, 'isWaitingResponse', false);
  }
};
