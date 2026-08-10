import { computed, observable, reaction, runInAction } from 'mobx';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const state = observable({ counter: 0 });

  const doubled = computed(() => state.counter * 2);

  const quadrupled = computed(() => doubled.get() * 2);

  let mut_lastValue = 0;

  const dispose = reaction(
    () => quadrupled.get(),
    (value) => {
      mut_lastValue = value;
    },
    { fireImmediately: true },
  );

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    runInAction(() => {
      state.counter = mut_i;
    });
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('derived-chain benchmark (MobX)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 4);
  });
}
