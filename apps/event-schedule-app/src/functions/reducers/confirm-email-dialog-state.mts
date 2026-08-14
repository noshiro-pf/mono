import { pipe } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { Obj, type Reducer } from '../../utils-ported/index.mjs';
import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  type EmailInputState,
} from './input-state/index.mjs';

export type ConfirmEmailDialogFormState = DeepReadonly<{
  email: EmailInputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const confirmEmailDialogFormInitialState = {
  email: emailInputInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const satisfies ConfirmEmailDialogFormState;

export const confirmEmailDialogHasError = (
  state: ConfirmEmailDialogFormState,
): boolean =>
  emailInputHasError(state.email) || state.otherErrors !== undefined;

export type ConfirmEmailDialogFormStateAction = DeepReadonly<
  | { type: 'done' }
  | { type: 'inputEmail'; payload: string }
  | { type: 'reset' }
  | { type: 'setEmailDoesNotMatchError' }
  | { type: 'setOtherError'; payload: string }
  | { type: 'submit' }
>;

export const confirmEmailDialogFormStateReducer: Reducer<
  ConfirmEmailDialogFormState,
  ConfirmEmailDialogFormStateAction
> = (state, action) => {
  switch (action.type) {
    case 'inputEmail':
      return {
        ...state,
        email: emailInputStateReducer(state.email, {
          type: 'input',
          payload: action.payload,
        }),
      };

    case 'setEmailDoesNotMatchError':
      return pipe(state)
        .map((draft) =>
          Obj.update(draft, 'email', (email) =>
            emailInputStateReducer(email, {
              type: 'setError',
              payload:
                dict.answerPage.eventInfo.verifyEmailDialog
                  .editButtonConfirmDialogValidationFailedMessage,
            }),
          ),
        )
        .map((draft) => ({ ...draft, isWaitingResponse: false })).value;

    case 'setOtherError':
      return pipe(state)
        .map((draft) => ({ ...draft, otherErrors: action.payload }))
        .map((draft) => ({ ...draft, isWaitingResponse: false })).value;

    case 'submit': {
      const emailNextState = emailInputStateReducer(state.email, {
        type: 'submit',
      });

      return pipe(state)
        .map((draft) => ({ ...draft, email: emailNextState }))
        .map((draft) => ({ ...draft, otherErrors: undefined }))
        .map((draft) => ({
          ...draft,
          isWaitingResponse: !emailInputHasError(emailNextState),
        })).value;
    }

    case 'done':
      return { ...state, isWaitingResponse: false };

    case 'reset':
      return confirmEmailDialogFormInitialState;
  }
};
