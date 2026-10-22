import { Tuple, configureStore, createSlice } from '@reduxjs/toolkit';

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

  let mut_lastValue = store.getState().value;

  store.subscribe(() => {
    mut_lastValue = store.getState().value;
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    store.dispatch(counterSlice.actions.set(mut_i));
  }

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('single-state benchmark (Redux)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000);
  });
}
