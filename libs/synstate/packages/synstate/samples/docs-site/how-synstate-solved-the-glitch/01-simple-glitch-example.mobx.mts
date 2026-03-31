import { computed, observable, reaction, runInAction } from 'mobx';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('simple-glitch-example (MobX)', async () => {
    const state = observable({ counter: 0 });

    const multipliedBy10 = computed(() => state.counter * 10);
    // 0, 10, 20, 30, ...

    const multipliedBy1000 = computed(() => state.counter * 1000);
    // 0, 1000, 2000, 3000, ...

    const sum = computed(() => multipliedBy10.get() + multipliedBy1000.get());
    // Expected: 0, 1010, 2020, 3030, ...

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    const dispose = reaction(
      () => sum.get(),
      (value) => {
        valueHistory.push(value);
      },
      { fireImmediately: true },
    );

    await new Promise<void>((resolve) => {
      let mut_count = 0;

      const interval = setInterval(() => {
        mut_count += 1;

        runInAction(() => {
          state.counter = mut_count;
        });

        if (mut_count >= 4) {
          clearInterval(interval);

          dispose();

          resolve();
        }
      }, 100);
    });

    // MobX computed values are lazily evaluated:
    // when `sum` is accessed, it first recomputes both dependencies,
    // so all values are consistent — no glitch.
    assert.deepStrictEqual(valueHistory, [0, 1010, 2020, 3030, 4040]);
    // embed-sample-code-ignore-below
  });
}
