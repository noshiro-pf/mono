import { type Atom, atom, createStore } from 'jotai/vanilla';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  const sourceAtom = atom(0);

  const store = createStore();

  let mut_currentAtom: Atom<number> = sourceAtom;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let mut_i = 0; mut_i < depth; mut_i++) {
    const prev = mut_currentAtom;

    const leftAtom = atom((get) => get(prev) + 1);

    const rightAtom = atom((get) => get(prev) + 2);

    mut_currentAtom = atom((get) => get(leftAtom) + get(rightAtom));
  }

  let mut_lastValue = store.get(mut_currentAtom);

  const unsub = store.sub(mut_currentAtom, () => {
    mut_lastValue = store.get(mut_currentAtom);
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    store.set(sourceAtom, mut_i);
  }

  unsub();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (Jotai)', () => {
    const result = runBenchmark(10, 4);

    assert.isAbove(result, 0);
  });
}
