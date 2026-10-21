import { createStore } from 'zustand/vanilla';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const store = createStore<Readonly<{ counter: number }>>()(() => ({
    counter: 0,
  }));

  let mut_lastValue = store.getState().counter;

  store.subscribe((state) => {
    mut_lastValue = state.counter;
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    store.setState({ counter: mut_i });
  }

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('single-state benchmark (Zustand)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000);
  });
}
