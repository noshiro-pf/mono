import { computed, effect, signal } from '@preact/signals-core';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const counter = signal(0);

  const doubled = computed(() => counter.value * 2);

  const quadrupled = computed(() => doubled.value * 2);

  let mut_lastValue = 0;

  const dispose = effect(() => {
    mut_lastValue = quadrupled.value;
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    counter.value = mut_i;
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('derived-chain benchmark (Preact Signals)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 4);
  });
}
