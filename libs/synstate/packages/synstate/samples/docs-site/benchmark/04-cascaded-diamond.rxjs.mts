import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { asSafeUint, range } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  const source = new BehaviorSubject(0);

  let mut_current = source.asObservable();

  for (const _i of range(0, asSafeUint(depth))) {
    const prev = mut_current;

    const left = prev.pipe(map((x) => x + 1));

    const right = prev.pipe(map((x) => x + 2));

    mut_current = combineLatest([left, right]).pipe(map(([l, r]) => l + r));
  }

  let mut_lastValue = 0;

  const subscription = mut_current.subscribe((v) => {
    mut_lastValue = v;
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    source.next(mut_i);
  }

  subscription.unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (RxJS)', () => {
    const result = runBenchmark(10, 4);

    assert.isAbove(result, 0);
  });
}
