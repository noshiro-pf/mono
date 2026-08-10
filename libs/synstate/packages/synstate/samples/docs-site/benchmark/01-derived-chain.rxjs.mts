import { BehaviorSubject, map } from 'rxjs';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const counter = new BehaviorSubject(0);

  const doubled = counter.pipe(map((x) => x * 2));

  const quadrupled = doubled.pipe(map((x) => x * 2));

  let mut_lastValue = 0;

  const subscription = quadrupled.subscribe((v) => {
    mut_lastValue = v;
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    counter.next(mut_i);
  }

  subscription.unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('derived-chain benchmark (RxJS)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 4);
  });
}
