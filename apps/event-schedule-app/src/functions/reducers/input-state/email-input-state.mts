import { pipe } from 'ts-data-forge';
import { type Reducer, isEmailString } from '../../../utils-ported/index.mjs';

export type EmailInputState = Readonly<{
  inputValue: string;
  error: string | undefined;
}>;

export const emailInputInitialState = {
  inputValue: '',
  error: undefined,
} as const satisfies EmailInputState;

export const emailInputHasError = (state: EmailInputState): boolean =>
  state.error !== undefined || state.inputValue === '';

export type EmailInputStateAction = Readonly<
  | { type: 'input'; payload: string }
  | { type: 'reset' }
  | { type: 'setError'; payload: string }
  | { type: 'submit' }
>;

export const emailInputStateReducer: Reducer<
  EmailInputState,
  EmailInputStateAction
> = (state, action) => {
  switch (action.type) {
    case 'input':
      return pipe(state)
        .map((draft) => ({ ...draft, inputValue: action.payload }))
        .map((draft) => ({ ...draft, error: emailInputInitialState.error }))
        .value;

    case 'setError':
      return { ...state, error: action.payload };

    case 'submit':
      return {
        ...state,
        error: !isEmailString(state.inputValue)
          ? dict.common.error.invalidEmail
          : undefined,
      };

    case 'reset':
      return emailInputInitialState;
  }
};
