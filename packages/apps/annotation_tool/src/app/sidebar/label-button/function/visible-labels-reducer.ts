import { ReducerType } from '@noshiro/ts-utils';

export const visibleLabelsReducer: ReducerType<
  readonly boolean[],
  | { type: 'init'; flags: readonly boolean[] }
  | { type: 'show-all' }
  | { type: 'hide-all' }
  | { type: 'flip'; index: number }
  | { type: 'set'; index: number; value: boolean }
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
