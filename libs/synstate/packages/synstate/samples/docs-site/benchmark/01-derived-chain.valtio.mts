import { proxy, subscribe } from 'valtio/vanilla';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const state = proxy({ counter: 0 });

  let mut_lastValue = state.counter * 2 * 2;

  const unsubscribe = subscribe(
    state,
    () => {
      mut_lastValue = state.counter * 2 * 2;
    },
    true,
  );

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    state.counter = mut_i;
  }

  unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('derived-chain benchmark (Valtio)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 4);
  });
}
