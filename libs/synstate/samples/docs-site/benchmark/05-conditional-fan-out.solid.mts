import { Arr, asUint32 } from 'ts-data-forge';
import {
  type Signal,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from './solid-js-client.mjs';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  let mut_lastValue = 0;

  const { branches, dispose } = createRoot((disposeRoot) => {
    const [selector] = createSignal(0);

    const branchSignals: readonly Signal<number>[] = Arr.zeros(
      asUint32(branchCount),
    ).map(() => createSignal(0));

    // Dynamic dependency: only tracks the branch selected by selector
    const result = createMemo(() => {
      const target = branchSignals[selector()];

      return target === undefined ? 0 : target[0]();
    });

    createEffect(() => {
      mut_lastValue = result();
    });

    return { branches: branchSignals, dispose: disposeRoot };
  });

  // Update an INACTIVE branch (branch 1, while selector = 0)
  const inactiveBranch = branches[1];

  if (inactiveBranch === undefined) {
    throw new Error('need at least 2 branches');
  }

  const [, setInactiveBranch] = inactiveBranch;

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    setInactiveBranch(mut_i);
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (Solid)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
