import type { EmailInputState } from './input-state';
import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
} from './input-state';

export type ConfirmEmailDialogFormState = DeepReadonly<{
  email: EmailInputState;
  otherErrors: string | undefined;
  isWaitingResponse: boolean;
}>;

export const confirmEmailDialogFormInitialState = {
  email: emailInputInitialState,
  otherErrors: undefined,
  isWaitingResponse: false,
} as const;

assertType<
  TypeExtends<
    typeof confirmEmailDialogFormInitialState,
    ConfirmEmailDialogFormState
  >
>();

export const confirmEmailDialogHasError = (
  state: ConfirmEmailDialogFormState
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
      return IRecord.set(
        state,
        'email',
        emailInputStateReducer(state.email, {
          type: 'input',
          payload: action.payload,
        })
      );

    case 'setEmailDoesNotMatchError':
      return pipe(state)
        .chain((draft) =>
          IRecord.update(draft, 'email', (email) =>
            emailInputStateReducer(email, {
              type: 'setError',
              payload:
                dict.answerPage.eventInfo.verifyEmailDialog
                  .editButtonConfirmDialogValidationFailedMessage,
            })
          )
        )
        .chain((draft) => IRecord.set(draft, 'isWaitingResponse', false)).value;

    case 'setOtherError':
      return pipe(state)
        .chain((draft) => IRecord.set(draft, 'otherErrors', action.payload))
        .chain((draft) => IRecord.set(draft, 'isWaitingResponse', false)).value;

    case 'submit': {
      const emailNextState = emailInputStateReducer(state.email, {
        type: 'submit',
      });

      return pipe(state)
        .chain((draft) => IRecord.set(draft, 'email', emailNextState))
        .chain((draft) => IRecord.set(draft, 'otherErrors', undefined))
        .chain((draft) =>
          IRecord.set(
            draft,
            'isWaitingResponse',
            !emailInputHasError(emailNextState)
          )
        ).value;
    }

    case 'done':
      return IRecord.set(state, 'isWaitingResponse', false);

    case 'reset':
      return confirmEmailDialogFormInitialState;
  }
};
