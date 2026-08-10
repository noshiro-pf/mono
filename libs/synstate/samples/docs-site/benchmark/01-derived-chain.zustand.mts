import { createStore } from 'zustand/vanilla';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const store = createStore<Readonly<{ counter: number }>>()(() => ({
    counter: 0,
  }));

  const selectQuadrupled = (state: Readonly<{ counter: number }>): number =>
    state.counter * 2 * 2;

  let mut_lastValue = selectQuadrupled(store.getState());

  store.subscribe((state) => {
    mut_lastValue = selectQuadrupled(state);
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    store.setState({ counter: mut_i });
  }

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('derived-chain benchmark (Zustand)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 4);
  });
}
