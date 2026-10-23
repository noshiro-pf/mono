import { combine, createState, map } from 'synstate';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('nested-write', () => {
    // embed-sample-code-ignore-above
    const [A, setA] = createState(0);

    const [R, setR] = createState(0);

    const B = A.pipe(map((n) => n * 10)); // depth 1

    const D = A.pipe(map((n) => n * 100)); // depth 1

    const BDR = combine([B, D, R]); // depth 2

    // A write from a subscriber: an update nested in the one that reached D.
    D.subscribe((d) => {
      if (d > 0) {
        setR(d);
      }
    });

    const mut_received: (readonly number[])[] = [];

    BDR.subscribe((values) => {
      mut_received.push(values);
    });

    setA(1); // warns once: a root written to from a subscriber

    // [0, 0, 0], then [10, 100, 100] twice: in setR(100), then in setA(1)
    // embed-sample-code-ignore-below

    assert.deepStrictEqual(
      [A.depth, R.depth, B.depth, D.depth, BDR.depth],
      [0, 0, 1, 1, 2],
    );

    assert.deepStrictEqual(mut_received, [
      [0, 0, 0],
      // the nested update, setR(100)
      [10, 100, 100],
      // the outer update, setA(1), visiting BDR from its own bucket
      [10, 100, 100],
    ]);
  });
}
