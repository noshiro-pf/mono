import { atom, createStore } from 'jotai/vanilla';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const counterAtom = atom(0);

  const doubledAtom = atom((get) => get(counterAtom) * 2);

  const tripledAtom = atom((get) => get(counterAtom) * 3);

  const sumAtom = atom((get) => get(doubledAtom) + get(tripledAtom));

  const store = createStore();

  let mut_lastValue = store.get(sumAtom);

  const unsub = store.sub(sumAtom, () => {
    mut_lastValue = store.get(sumAtom);
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    store.set(counterAtom, mut_i);
  }

  unsub();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('diamond-dependency benchmark (Jotai)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 5);
  });
}
