import { assertType, IRecord, pipe } from '@noshiro/ts-utils';
import type { Reducer } from 'react';

export type InputState = DeepReadonly<{
  inputValue: string;
  error: string | undefined;
}>;

export const inputInitialState = {
  inputValue: '',
  error: undefined,
} as const;

assertType<TypeExtends<typeof inputInitialState, InputState>>();

export const inputHasError = (state: InputState): boolean =>
  state.error !== undefined || state.inputValue === '';

export type InputStateAction = DeepReadonly<
  { type: 'input'; payload: string } | { type: 'setError'; payload: string }
>;

export const inputStateReducer: Reducer<InputState, InputStateAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'input':
      return pipe(state)
        .chain((draft) => IRecord.set(draft, 'inputValue', action.payload))
        .chain((draft) => IRecord.set(draft, 'error', inputInitialState.error))
        .value;

    case 'setError':
      return IRecord.set(state, 'error', action.payload);
  }
};
