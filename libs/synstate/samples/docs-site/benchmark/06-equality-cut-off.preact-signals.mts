import { computed, effect, signal } from '@preact/signals-core';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const source = signal(0);

  // Equal to its previous value on 999 updates in 1000. A `computed` compares
  // its result and keeps its version when it is equal.
  const bucket = computed(() => Math.floor(source.value / 1000));

  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  const disposers = Arr.seq(asUint32(width)).map((i) => {
    const view = computed(() => bucket.value + i);

    return effect(() => {
      mut_lastValues[i] = view.value;
    });
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    source.value = mut_i;
  }

  for (const dispose of disposers) {
    dispose();
  }

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (Preact Signals)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
