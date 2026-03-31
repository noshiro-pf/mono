import { type WritableAtom, atom, createStore } from 'jotai/vanilla';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, branchCount: number): number => {
  const selectorAtom = atom(0);

  const branchAtoms: readonly WritableAtom<
    number,
    Mutable<readonly [number]>,
    void
  >[] = Arr.zeros(asUint32(branchCount)).map(() => atom(0));

  // Dynamic dependency: only reads the branch selected by selectorAtom
  const resultAtom = atom((get) => {
    const sel = get(selectorAtom);

    const targetAtom = branchAtoms[sel];

    if (targetAtom === undefined) {
      return 0;
    }

    return get(targetAtom);
  });

  const store = createStore();

  let mut_lastValue = store.get(resultAtom);

  const unsub = store.sub(resultAtom, () => {
    mut_lastValue = store.get(resultAtom);
  });

  // Update an INACTIVE branch (branch 1, while selector = 0)
  const inactiveBranchAtom = branchAtoms[1];

  if (inactiveBranchAtom === undefined) {
    throw new Error('need at least 2 branches');
  }

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    store.set(inactiveBranchAtom, mut_i);
  }

  unsub();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('conditional-fan-out benchmark (Jotai)', () => {
    const result = runBenchmark(10, 5);

    // selector=0, active branch=branch[0] which stays at 0
    assert.strictEqual(result, 0);
  });
}
