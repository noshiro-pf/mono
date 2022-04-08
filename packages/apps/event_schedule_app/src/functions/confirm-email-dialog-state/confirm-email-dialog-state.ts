import { isEmailString } from '@noshiro/ts-utils-additional';

export type ConfirmEmailDialogState = DeepReadonly<{
  showErrorOf: {
    invalidEmailFormat: boolean;
    emailDoesNotMatch: boolean;
  };
  emailBeingEdited: string;
}>;

export const confirmEmailDialogInitialState = {
  showErrorOf: {
    invalidEmailFormat: false,
    emailDoesNotMatch: false,
  },
  emailBeingEdited: '',
} as const;

assertType<
  TypeExtends<typeof confirmEmailDialogInitialState, ConfirmEmailDialogState>
>();

export const confirmEmailDialogHasError = (
  state: ConfirmEmailDialogState
): boolean =>
  IRecord.values(state.showErrorOf).some((b) => b) ||
  state.emailBeingEdited === '';

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
        emailBeingEdited: '',
        showErrorOf: {
          emailDoesNotMatch: false,
          invalidEmailFormat: false,
        },
      };

    case 'clickEnterButton': {
      const showErrorOf = {
        invalidEmailFormat: !isEmailString(state.emailBeingEdited),
        emailDoesNotMatch:
          state.emailBeingEdited !== action.payload.emailAnswer,
      };
      return {
        emailBeingEdited: state.emailBeingEdited,
        showErrorOf,
      };
    }

    case 'inputEmail': {
      const emailBeingEdited = action.payload.value;

      // if the last operation is backspace
      if (
        confirmEmailDialogHasError(state) &&
        state.emailBeingEdited.length === emailBeingEdited.length + 1 &&
        state.emailBeingEdited.slice(0, -1) === emailBeingEdited
      ) {
        return {
          emailBeingEdited: '',
          showErrorOf: {
            emailDoesNotMatch: false,
            invalidEmailFormat: false,
          },
        };
      }
      return {
        emailBeingEdited,
        showErrorOf: {
          emailDoesNotMatch: false,
          invalidEmailFormat: false,
        },
      };
    }
  }
};
