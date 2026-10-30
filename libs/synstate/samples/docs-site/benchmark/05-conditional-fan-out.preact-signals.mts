import { type Signal, computed, effect, signal } from '@preact/signals-core';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  const selector = signal(0);

  const branches: readonly Signal<number>[] = Arr.zeros(
    asUint32(branchCount),
  ).map(() => signal(0));

  // Dynamic dependency: only tracks the branch selected by selector
  const result = computed(() => {
    const target = branches[selector.value];

    return target === undefined ? 0 : target.value;
  });

  let mut_lastValue = 0;

  const dispose = effect(() => {
    mut_lastValue = result.value;
  });

  // Update an INACTIVE branch (branch 1, while selector = 0)
  const inactiveBranch = branches[1];

  if (inactiveBranch === undefined) {
    throw new Error('need at least 2 branches');
  }

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    inactiveBranch.value = mut_i;
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (Preact Signals)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
