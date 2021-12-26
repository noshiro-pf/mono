import { isEmailString } from '@noshiro/ts-utils';
import type { Reducer } from 'react';

export type ConfirmEmailDialogState = DeepReadonly<{
  showErrorOf: {
    invalidEmailFormat: boolean;
    emailDoesNotMatch: boolean;
  };
  enterButtonDisabled: boolean;
  emailBeingInput: string;
}>;

export const confirmEmailDialogInitialState = {
  showErrorOf: {
    invalidEmailFormat: false,
    emailDoesNotMatch: false,
  },
  enterButtonDisabled: true,
  emailBeingInput: '',
} as const;

export const confirmEmailDialogHasError = (
  state: ConfirmEmailDialogState
): boolean => Object.values(state.showErrorOf).some((b) => b);

export type ConfirmEmailDialogStateAction = DeepReadonly<
  | {
      type: 'clickCancelButton';
    }
  | {
      type: 'clickEnterButton';
      payload: { emailAnswer: string };
    }
  | {
      type: 'inputEmail';
      payload: { value: string };
    }
>;

export const confirmEmailDialogStateReducer: Reducer<
  ConfirmEmailDialogState,
  ConfirmEmailDialogStateAction
> = (state, action) => {
  switch (action.type) {
    case 'clickCancelButton':
      return {
        emailBeingInput: '',
        enterButtonDisabled: true,
        showErrorOf: {
          emailDoesNotMatch: false,
          invalidEmailFormat: false,
        },
      };

    case 'clickEnterButton': {
      const showErrorOf = {
        invalidEmailFormat: !isEmailString(state.emailBeingInput),
        emailDoesNotMatch: state.emailBeingInput !== action.payload.emailAnswer,
      };
      return {
        emailBeingInput: state.emailBeingInput,
        enterButtonDisabled: confirmEmailDialogHasError(state),
        showErrorOf,
      };
    }

    case 'inputEmail': {
      const emailBeingInput = action.payload.value;

      // if the last operation is backspace
      if (
        confirmEmailDialogHasError(state) &&
        state.emailBeingInput.length === emailBeingInput.length + 1 &&
        state.emailBeingInput.slice(0, -1) === emailBeingInput
      ) {
        return {
          emailBeingInput: '',
          enterButtonDisabled: emailBeingInput === '',
          showErrorOf: {
            emailDoesNotMatch: false,
            invalidEmailFormat: false,
          },
        };
      }
      return {
        emailBeingInput,
        enterButtonDisabled: emailBeingInput === '',
        showErrorOf: {
          emailDoesNotMatch: false,
          invalidEmailFormat: false,
        },
      };
    }
  }
};
