import {
  emailInputHasError,
  emailInputInitialState,
  emailInputStateReducer,
  type EmailInputState,
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

expectType<
  typeof confirmEmailDialogFormInitialState,
  ConfirmEmailDialogFormState
>('<=');

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
      return Obj.set(
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
          Obj.update(draft, 'email', (email) =>
            emailInputStateReducer(email, {
              type: 'setError',
              payload:
                dict.answerPage.eventInfo.verifyEmailDialog
                  .editButtonConfirmDialogValidationFailedMessage,
            })
          )
        )
        .chain((draft) => Obj.set(draft, 'isWaitingResponse', false)).value;

    case 'setOtherError':
      return pipe(state)
        .chain((draft) => Obj.set(draft, 'otherErrors', action.payload))
        .chain((draft) => Obj.set(draft, 'isWaitingResponse', false)).value;

    case 'submit': {
      const emailNextState = emailInputStateReducer(state.email, {
        type: 'submit',
      });

      return pipe(state)
        .chain((draft) => Obj.set(draft, 'email', emailNextState))
        .chain((draft) => Obj.set(draft, 'otherErrors', undefined))
        .chain((draft) =>
          Obj.set(
            draft,
            'isWaitingResponse',
            !emailInputHasError(emailNextState)
          )
        ).value;
    }

    case 'done':
      return Obj.set(state, 'isWaitingResponse', false);

    case 'reset':
      return confirmEmailDialogFormInitialState;
  }
};
