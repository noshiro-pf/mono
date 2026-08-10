import { atom, createStore } from 'jotai/vanilla';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('simple-glitch-example (Jotai)', async () => {
    // Jotai supports diamond dependencies natively through derived atoms.
    // Derived atoms are lazily evaluated — when a subscriber reads `sumAtom`,
    // it triggers recomputation of both dependencies,
    // so all values are always consistent.

    const counterAtom = atom(0);

    const multipliedBy10Atom = atom((get) => get(counterAtom) * 10);
    // 0, 10, 20, 30, ...

    const multipliedBy1000Atom = atom((get) => get(counterAtom) * 1000);
    // 0, 1000, 2000, 3000, ...

    const sumAtom = atom(
      (get) => get(multipliedBy10Atom) + get(multipliedBy1000Atom),
    );
    // Expected: 0, 1010, 2020, 3030, ...

    const store = createStore();

    // Record initial value
    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [store.get(sumAtom)];

    // Subscribe to future changes
    store.sub(sumAtom, () => {
      valueHistory.push(store.get(sumAtom));
    });

    await new Promise<void>((resolve) => {
      let mut_count = 0;

      const interval = setInterval(() => {
        mut_count += 1;

        store.set(counterAtom, mut_count);

        if (mut_count >= 4) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    // Jotai derived atoms are lazily evaluated (like MobX computed),
    // so diamond dependencies are always consistent — no glitch.
    assert.deepStrictEqual(valueHistory, [0, 1010, 2020, 3030, 4040]);

    // embed-sample-code-ignore-below
  });
}
