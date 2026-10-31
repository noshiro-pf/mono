import { computed, observable, reaction, runInAction } from 'mobx';
import { Arr, asUint32 } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, width: number): number => {
  const state = observable({ source: 0 });

  // Equal to its previous value on 999 updates in 1000. A `computed` compares
  // its result and does not change when it is equal.
  const bucket = computed(() => Math.floor(state.source / 1000));

  const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

  const disposers = Arr.seq(asUint32(width)).map((i) => {
    const view = computed(() => bucket.get() + i);

    return reaction(
      () => view.get(),
      (v) => {
        mut_lastValues[i] = v;
      },
      { fireImmediately: true },
    );
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    runInAction(() => {
      state.source = mut_i;
    });
  }

  for (const dispose of disposers) {
    dispose();
  }

  return Arr.sum(mut_lastValues);
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('equality-cut-off benchmark (MobX)', () => {
    const result = runBenchmark(2500, 3);

    // The last write is 2500, in bucket 2, so the views hold 2, 3 and 4.
    assert.strictEqual(result, 9);
  });
}
