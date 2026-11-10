import { createState, derive, map } from 'synstate-next';

// embed-sample-code-ignore-above
export const runBenchmark = (n: number): number => {
  const [counter, setCounter] = createState(0);

  const doubled = counter.pipe(map((x) => x * 2));

  const tripled = counter.pipe(map((x) => x * 3));

  const sum = derive([doubled, tripled], (d, t) => d + t);

  let mut_lastValue = 0;

  const unsubscribe = sum.subscribe((v) => {
    mut_lastValue = v;
  });

  for (let mut_i = 1; mut_i <= n; mut_i++) {
    setCounter(mut_i);
  }

  unsubscribe();

  return mut_lastValue;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('diamond-dependency benchmark (synstate-next)', () => {
    const result = runBenchmark(1000);

    assert.strictEqual(result, 1000 * 5);
  });

  test('the subscriber sees no mix of old and new values', () => {
    const [counter, setCounter] = createState(0);

    const sum = derive(
      [counter.pipe(map((x) => x * 2)), counter.pipe(map((x) => x * 3))],
      (d, t) => d + t,
    );

    const mut_seen: number[] = [];

    const unsubscribe = sum.subscribe((v) => {
      mut_seen.push(v);
    });

    setCounter(1);

    setCounter(2);

    unsubscribe();

    assert.deepStrictEqual(mut_seen, [0, 5, 10]);
  });
}
