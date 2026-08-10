import { computed, observable, reaction } from 'mobx';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  const selector = observable.box(0);

  const branches: readonly ReturnType<typeof observable.box<number>>[] =
    Arr.zeros(asUint32(branchCount)).map(() => observable.box(0));

  // Dynamic dependency: only tracks the branch selected by selector
  const result = computed(() => {
    const sel = selector.get();

    const target = branches[sel];

    if (target === undefined) {
      return 0;
    }

    return target.get();
  });

  let mut_lastValue = 0;

  const dispose = reaction(
    () => result.get(),
    (value) => {
      mut_lastValue = value ?? 0;
    },
    { fireImmediately: true },
  );

  // Update an INACTIVE branch (branch 1, while selector = 0)
  const inactiveBranch = branches[1];

  if (inactiveBranch === undefined) {
    throw new Error('need at least 2 branches');
  }

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    inactiveBranch.set(mut_i);
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (MobX)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
