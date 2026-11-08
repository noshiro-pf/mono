import { createState, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a write in the drain waits for the round to end', () => {
    // embed-sample-code-ignore-above
    const [a, setA] = createState(0);

    const [b, setB] = createState(0);

    const mut_log: string[] = [];

    // A write from inside a derivation, shown only for the order: derive the
    // value instead.
    const watched = a.pipe(
      map((x) => {
        setB(x * 10);

        mut_log.push(`b = ${b.value} right after setB(${x * 10})`);

        return x;
      }),
    );

    watched.subscribe(() => {
      mut_log.push(`b = ${b.value} in the effects`);
    });

    const start = mut_log.length;

    setA(1);

    // The write waits, and the effects of this round still see the old value.
    assert.deepStrictEqual(mut_log.slice(start), [
      'b = 0 right after setB(10)',
      'b = 0 in the effects',
    ]);

    // Applied after the effects, it started the next round.
    assert.strictEqual(b.value, 10);

    // embed-sample-code-ignore-below
  });
}
