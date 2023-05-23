export type InputState = Readonly<{
  inputValue: string;
  error: string | undefined;
}>;

export const inputInitialState = {
  inputValue: '',
  error: undefined,
} as const satisfies InputState;

export const inputHasError = (state: InputState): boolean =>
  state.error !== undefined || state.inputValue === '';

export type InputStateAction = Readonly<
  | { type: 'input'; payload: string }
  | { type: 'reset' }
  | { type: 'setError'; payload: string }
>;

export const inputStateReducer: Reducer<InputState, InputStateAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'input':
      return pipe(state)
        .chain((draft) => Obj.set(draft, 'inputValue', action.payload))
        .chain((draft) => Obj.set(draft, 'error', inputInitialState.error))
        .value;

    case 'setError':
      return Obj.set(state, 'error', action.payload);

    case 'reset':
      return inputInitialState;
  }
};
