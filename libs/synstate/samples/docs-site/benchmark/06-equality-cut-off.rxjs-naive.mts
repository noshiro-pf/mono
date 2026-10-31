import { BehaviorSubject, map, shareReplay } from 'rxjs';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const source = new BehaviorSubject(0);

  // The same graph without `distinctUntilChanged`: the bucket is emitted on
  // every update, equal or not, and every view runs.
  const bucket = source.pipe(
    map((v) => Math.floor(v / 1000)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  const subscriptions = Arr.seq(asUint32(width)).map((i) =>
    bucket.pipe(map((b) => b + i)).subscribe((v) => {
      mut_lastValues[i] = v;
    }),
  );

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    source.next(mut_i);
  }

  for (const subscription of subscriptions) {
    subscription.unsubscribe();
  }

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (RxJS, naive)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
