import {
  type ReadonlySignal,
  computed,
  effect,
  signal,
} from '@preact/signals-core';
import { asSafeUint, range } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  const source = signal(0);

  let mut_current: ReadonlySignal<number> = source;

  for (const _i of range(0, asSafeUint(depth))) {
    const prev = mut_current;

    const left = computed(() => prev.value + 1);

    const right = computed(() => prev.value + 2);

    mut_current = computed(() => left.value + right.value);
  }

  const final = mut_current;

  let mut_lastValue = 0;

  const dispose = effect(() => {
    mut_lastValue = final.value;
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    source.value = mut_i;
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (Preact Signals)', () => {
    const result = runBenchmark(10, 4);

    // Each level maps x to (x + 1) + (x + 2): 10 → 23 → 49 → 101 → 205.
    assert.strictEqual(result, 205);
  });
}
