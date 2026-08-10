import { atom, createStore } from 'jotai/vanilla';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const counterAtom = atom(0);

  const doubledAtom = atom((get) => get(counterAtom) * 2);

  const quadrupledAtom = atom((get) => get(doubledAtom) * 2);

  const store = createStore();

  let mut_lastValue = store.get(quadrupledAtom);

  const unsub = store.sub(quadrupledAtom, () => {
    mut_lastValue = store.get(quadrupledAtom);
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    store.set(counterAtom, mut_i);
  }

  unsub();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('derived-chain benchmark (Jotai)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 4);
  });
}
