import { atom, createStore } from 'jotai/vanilla';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const sourceAtom = atom(0);

  // Equal to its previous value on 999 updates in 1000. A derived atom compares
  // its result with `Object.is` and does not change when it is equal.
  const bucketAtom = atom((get) => Math.floor(get(sourceAtom) / 1000));

  const store = createStore();

  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  const disposers = Arr.seq(asUint32(width)).map((i) => {
    const viewAtom = atom((get) => get(bucketAtom) + i);

    mut_lastValues[i] = store.get(viewAtom);

    return store.sub(viewAtom, () => {
      mut_lastValues[i] = store.get(viewAtom);
    });
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    store.set(sourceAtom, mut_i);
  }

  for (const dispose of disposers) {
    dispose();
  }

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (Jotai)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
