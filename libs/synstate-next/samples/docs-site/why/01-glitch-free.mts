import { createState, derive, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('glitch-free diamond', () => {
    // embed-sample-code-ignore-above
    const [a, setA] = createState(1);

    const tens = a.pipe(map((x) => x * 10));

    const hundreds = a.pipe(map((x) => x * 100));

    let mut_computed = 0;

    const sum = derive([tens, hundreds], (t, h) => {
      mut_computed += 1;

      return t + h;
    });

    const mut_seen: number[] = [];

    sum.subscribe((value) => {
      mut_seen.push(value);
    });

    setA(2);

    // Never 120 or 210: `sum` is computed once per update, after both of its
    // parents, and its subscriber runs once every value is up to date.
    assert.deepStrictEqual(mut_seen, [110, 220]);

    assert.strictEqual(mut_computed, 2);

    // embed-sample-code-ignore-below
  });
}
