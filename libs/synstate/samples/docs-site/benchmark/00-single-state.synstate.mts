import { createState } from 'synstate';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const [counter, setCounter] = createState(0);

  let mut_lastValue = 0;

  const subscription = counter.subscribe((v) => {
    mut_lastValue = v;
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    setCounter(mut_i);
  }

  subscription.unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('single-state benchmark (synstate)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000);
  });
}
