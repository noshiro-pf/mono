import { combine, createState, map } from 'synstate';

// embed-sample-code-ignore-above
export const runBenchmark = (k: number, depth: number): number => {
  const [source, setSource] = createState(0);

  let mut_current = source;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let mut_i = 0; mut_i < depth; mut_i++) {
    const prev = mut_current;

    const left = prev.pipe(map((x) => x + 1));

    const right = prev.pipe(map((x) => x + 2));

    mut_current = combine([left, right]).pipe(map(([l, r]) => l + r));
  }

  let mut_lastValue = 0;

  const subscription = mut_current.subscribe((v) => {
    mut_lastValue = v;
  });

  for (let mut_i = 1; mut_i <= k; mut_i++) {
    setSource(mut_i);
  }

  subscription.unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('cascaded-diamond benchmark (synstate)', () => {
    const result = runBenchmark(10, 4);

    assert.isAbove(result, 0);
  });
}
