import { createState, derive, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('the drain, then the effects', () => {
    // embed-sample-code-ignore-above
    const mut_log: string[] = [];

    const [a, setA] = createState(1);

    const b = a.pipe(
      map((x) => {
        mut_log.push(`compute b from a = ${x}`);

        return x + 1;
      }),
    );

    const c = derive([a, b], (x, y) => {
      mut_log.push(`compute c from a = ${x}, b = ${y}`);

      return x + y;
    });

    a.subscribe((x) => {
      mut_log.push(`effect of a: a = ${x}, c = ${c.value}`);
    });

    c.subscribe((x) => {
      mut_log.push(`effect of c: c = ${x}`);
    });

    const start = mut_log.length;

    setA(2);

    assert.deepStrictEqual(mut_log.slice(start), [
      // Recomputing: each node once, after its parents.
      'compute b from a = 2',
      'compute c from a = 2, b = 3',
      // The effects, every value up to date: a's effect already sees the new c.
      'effect of a: a = 2, c = 5',
      'effect of c: c = 5',
    ]);

    // embed-sample-code-ignore-below
  });
}
