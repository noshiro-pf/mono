import { createState, derive, type Observable } from 'synstate-next';
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

  // Every branch is a parent, so every write to one recomputes this.
  const result = derive(
    // `derive` passes the values as a tuple only when given an array literal.
    // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing
    [selector, ...branches.map((b) => b.source)],
    (selectorValue, ...branchValues) => branchValues[selectorValue] ?? 0,
  );

  let mut_lastValue = 0;

  const unsubscribe = result.subscribe((v) => {
    mut_lastValue = v;
  });

  // Update a branch the selector does not pick (branch 1, while it picks 0).
  const inactiveBranch = branches[1];

  if (inactiveBranch === undefined) {
    throw new Error('need at least 2 branches');
  }

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    inactiveBranch.set(mut_i);
  }

  unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (synstate-next, naive derive)', () => {
    const result = runBenchmark(10, 5);

    // The selector picks branch 0, which stays at 0.
    assert.strictEqual(result, 0);
  });
}
