import {
  Tuple,
  configureStore,
  createSelector,
  createSlice,
  lruMemoize,
} from '@reduxjs/toolkit';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
      set: (state, action: Readonly<{ payload: number }>) => {
        state.value = action.payload;
      },
    },
  });

  const store = configureStore({
    reducer: counterSlice.reducer,
    middleware: () => new Tuple(),
  });

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const selectCounter = (state: Readonly<{ value: number }>): number =>
    state.value;

  // Equal to its previous value on 999 updates in 1000, so each view's
  // selector, which compares its input with the previous one, returns its
  // cached result. `lruMemoize` for the reason the derived chain gives.
  const selectBucket = createSelector(
    selectCounter,
    (counter) => Math.floor(counter / 1000),
    { memoize: lruMemoize },
  );

  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  // One subscriber per view, as each `useSelector` is: the store calls every
  // one of them on every dispatch.
  const disposers = Arr.seq(asUint32(width)).map((i) => {
    const selectView = createSelector(selectBucket, (b) => b + i, {
      memoize: lruMemoize,
    });

    mut_lastValues[i] = selectView(store.getState());

    return store.subscribe(() => {
      mut_lastValues[i] = selectView(store.getState());
    });
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    store.dispatch(counterSlice.actions.set(mut_i));
  }

  for (const dispose of disposers) {
    dispose();
  }

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (Redux)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
