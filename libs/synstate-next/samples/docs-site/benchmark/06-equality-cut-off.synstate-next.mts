import { createState, map } from 'synstate-next';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const [source, setSource] = createState(0);

  // Equal to its previous value on 999 updates in 1000. `map` compares its
  // result with `Object.is`, and a value that does not change stops there.
  const bucket = source.pipe(map((v) => Math.floor(v / 1000)));

  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  const unsubscribes = Arr.seq(asUint32(width)).map((i) =>
    bucket.pipe(map((b) => b + i)).subscribe((v) => {
      mut_lastValues[i] = v;
    }),
  );

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    setSource(mut_i);
  }

  for (const unsubscribe of unsubscribes) {
    unsubscribe();
  }

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (synstate-next)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
