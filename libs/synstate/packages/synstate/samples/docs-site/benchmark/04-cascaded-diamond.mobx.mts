import {
  type IComputedValue,
  computed,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { asSafeUint, range } from 'ts-data-forge';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  const state = observable({ source: 0 });

  let mut_current: IComputedValue<number> = computed(() => state.source);

  for (const _i of range(0, asSafeUint(depth))) {
    const prev = mut_current;

    const left = computed(() => prev.get() + 1);

    const right = computed(() => prev.get() + 2);

    mut_current = computed(() => left.get() + right.get());
  }

  const finalComputed = mut_current;

  let mut_lastValue = 0;

  const dispose = reaction(
    () => finalComputed.get(),
    (value) => {
      mut_lastValue = value;
    },
    { fireImmediately: true },
  );

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    runInAction(() => {
      state.source = mut_i;
    });
  }

  dispose();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (MobX)', () => {
    const result = runBenchmark(10, 4);

    assert.isAbove(result, 0);
  });
}
