import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  const selector = new BehaviorSubject(0);

  const branches: readonly BehaviorSubject<number>[] = Arr.zeros(
    asUint32(branchCount),
  ).map(() => new BehaviorSubject(0));

  // `combineLatest` only infers the element types from an array literal.
  // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing
  const result = combineLatest([selector, ...branches]).pipe(
    map((values) => {
      const sel = values[0];

      return values[sel + 1] ?? 0;
    }),
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
    inactiveBranch.next(mut_i);
  }

  subscription.unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (RxJS)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
