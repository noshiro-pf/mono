import { Arr, asSafeUint, asUint32, range } from 'ts-data-forge';
import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from './solid-js-client.mjs';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  const { setSource, dispose } = createRoot((disposeRoot) => {
    const [source, setSourceValue] = createSignal(0);

    // Equal to its previous value on 999 updates in 1000. A memo compares its
    // result with `===` and does not change when it is equal.
    const bucket = createMemo(() => Math.floor(source() / 1000));

    for (const i of range(0, asSafeUint(width))) {
      const view = createMemo(() => bucket() + i);

      createEffect(() => {
        mut_lastValues[i] = view();
      });
    }

    return { setSource: setSourceValue, dispose: disposeRoot };
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    setSource(mut_i);
  }

  dispose();

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (Solid)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
