import {
  Tuple,
  configureStore,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
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

  const selectDoubled = createSelector(selectCounter, (counter) => counter * 2);

  const selectTripled = createSelector(selectCounter, (counter) => counter * 3);

  const selectSum = createSelector(
    selectDoubled,
    selectTripled,
    (doubled, tripled) => doubled + tripled,
  );

  let mut_lastValue = selectSum(store.getState());

  store.subscribe(() => {
    mut_lastValue = selectSum(store.getState());
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    store.dispatch(counterSlice.actions.set(mut_i));
  }

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('diamond-dependency benchmark (Redux)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 5);
  });
}
