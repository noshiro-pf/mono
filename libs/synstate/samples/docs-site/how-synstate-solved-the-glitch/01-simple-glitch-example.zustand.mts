import { createStore } from 'zustand/vanilla';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('simple-glitch-example (Zustand)', async () => {
    // Zustand uses a single store object, similar to Redux.
    // Derived values are computed via selector functions
    // that read from the store's state snapshot.
    // Since all selectors read from the same snapshot,
    // there is no propagation graph and thus no diamond dependency.

    const store = createStore<Readonly<{ counter: number }>>()(() => ({
      counter: 0,
    }));

    const selectSum = (state: Readonly<{ counter: number }>): number =>
      state.counter * 10 + state.counter * 1000;

    // Record initial value
    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [selectSum(store.getState())];

    // Subscribe to future changes
    store.subscribe((state) => {
      valueHistory.push(selectSum(state));
    });

    await new Promise<void>((resolve) => {
      let mut_count = 0;

      const interval = setInterval(() => {
        mut_count += 1;

        store.setState({ counter: mut_count });

        if (mut_count >= 4) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    // Zustand selectors always read from a single consistent state snapshot,
    // so diamond dependencies are structurally impossible — no glitch.
    assert.deepStrictEqual(valueHistory, [0, 1010, 2020, 3030, 4040]);

    // embed-sample-code-ignore-below
  });
}
