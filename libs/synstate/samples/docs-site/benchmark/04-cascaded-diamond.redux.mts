import {
  Tuple,
  configureStore,
  createSelector,
  createSlice,
  lruMemoize,
} from '@reduxjs/toolkit';
import { asSafeUint, range } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  const sourceSlice = createSlice({
    name: 'source',
    initialState: { value: 0 },
    reducers: {
      set: (state, action: Readonly<{ payload: number }>) => {
        state.value = action.payload;
      },
    },
  });

  const store = configureStore({
    reducer: sourceSlice.reducer,
    middleware: () => new Tuple(),
  });

  // eslint-disable-next-line unicorn/consistent-function-scoping
  let mut_current = (state: Readonly<{ value: number }>): number => state.value;

  // Each stage is two selectors over the previous one and a third over both,
  // as in the other libraries. `lruMemoize` for the reason the diamond
  // scenario gives: every input is a number that never repeats.
  for (const _i of range(0, asSafeUint(depth))) {
    const prev = mut_current;

    const selectLeft = createSelector(prev, (value) => value + 1, {
      memoize: lruMemoize,
    });

    const selectRight = createSelector(prev, (value) => value + 2, {
      memoize: lruMemoize,
    });

    mut_current = createSelector(
      selectLeft,
      selectRight,
      (left, right) => left + right,
      { memoize: lruMemoize },
    );
  }

  const selectFinal = mut_current;

  let mut_lastValue = selectFinal(store.getState());

  store.subscribe(() => {
    mut_lastValue = selectFinal(store.getState());
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    store.dispatch(sourceSlice.actions.set(mut_i));
  }

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (Redux)', () => {
    const result = runBenchmark(10, 4);

    assert.isAbove(result, 0);
  });
}
