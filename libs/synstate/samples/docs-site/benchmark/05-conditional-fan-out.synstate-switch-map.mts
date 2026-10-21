import { createState, just, switchMap, type Observable } from 'synstate';
import { Arr, asUint32 } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  const [selector] = createState(0);

  const branches: DeepReadonly<
    {
      source: Observable<number>;
      set: (v: number) => void;
    }[]
  > = Arr.zeros(asUint32(branchCount)).map(() => {
    const [source, setSource] = createState(0);

    return { source, set: setSource };
  });

  // Dynamic dependency: only follows the branch selected by selector
  const result = selector.pipe(
    switchMap((sel) => branches[sel]?.source ?? just(0)),
  );

  let mut_lastValue = 0;

  const subscription = result.subscribe((v) => {
    mut_lastValue = v;
  });

  // Update an INACTIVE branch (branch 1, while selector = 0)
  const inactiveBranch = branches[1];

  if (inactiveBranch === undefined) {
    throw new Error('need at least 2 branches');
  }

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    inactiveBranch.set(mut_i);
  }

  subscription.unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (synstate, switchMap)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
