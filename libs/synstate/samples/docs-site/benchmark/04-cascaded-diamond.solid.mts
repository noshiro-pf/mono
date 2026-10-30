import { asSafeUint, range } from 'ts-data-forge';
import {
  type Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from './solid-js-client.mjs';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  let mut_lastValue = 0;

  const { setSource, dispose } = createRoot((disposeRoot) => {
    const [source, setSourceValue] = createSignal(0);

    let mut_current: Accessor<number> = source;

    for (const _i of range(0, asSafeUint(depth))) {
      const prev = mut_current;

      const left = createMemo(() => prev() + 1);

      const right = createMemo(() => prev() + 2);

      mut_current = createMemo(() => left() + right());
    }

    const final = mut_current;

    createEffect(() => {
      mut_lastValue = final();
    });

    return { setSource: setSourceValue, dispose: disposeRoot };
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    setSource(mut_i);
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (Solid)', () => {
    const result = runBenchmark(10, 4);

    // Each level maps x to (x + 1) + (x + 2): 10 → 23 → 49 → 101 → 205.
    assert.strictEqual(result, 205);
  });
}
