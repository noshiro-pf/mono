import { isEmailString } from '@noshiro/ts-utils-additional';
import type { Reducer } from 'react';
import { dict } from '../../constants';

export type EmailInputState = DeepReadonly<{
  inputValue: string;
  error: string | undefined;
}>;

export const emailInputInitialState = {
  inputValue: '',
  error: undefined,
} as const;

assertType<TypeExtends<typeof emailInputInitialState, EmailInputState>>();

export const emailInputHasError = (state: EmailInputState): boolean =>
  state.error !== undefined || state.inputValue === '';

export type EmailInputStateAction = DeepReadonly<
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
        .chain((draft) => IRecord.set(draft, 'inputValue', action.payload))
        .chain((draft) =>
          IRecord.set(draft, 'error', emailInputInitialState.error)
        ).value;

    case 'setError':
      return IRecord.set(state, 'error', action.payload);

    case 'submit':
      return IRecord.set(
        state,
        'error',
        !isEmailString(state.inputValue)
          ? dict.common.error.invalidEmail
          : undefined
      );

    case 'reset':
      return emailInputInitialState;
  }
};
