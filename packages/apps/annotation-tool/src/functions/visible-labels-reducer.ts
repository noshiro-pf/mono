export const visibleLabelsReducer: Reducer<
  readonly boolean[],
  | { type: 'flip'; index: number }
  | { type: 'hide-all' }
  | { type: 'init'; flags: readonly boolean[] }
  | { type: 'set'; index: number; value: boolean }
  | { type: 'show-all' }
> = (state, action) => {
  switch (action.type) {
    case 'show-all':
      return state.map(() => true);
    case 'hide-all':
      return state.map(() => false);
    case 'flip':
      return state.map((b, i) => (i === action.index ? !b : b));
    case 'set':
      return state.map((b, i) => (i === action.index ? action.value : b));
    case 'init':
      return action.flags;
    default:
      return state;
  }
};
