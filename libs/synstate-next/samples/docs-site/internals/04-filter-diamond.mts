import { createState, derive, filter, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('the filter diamond', () => {
    // embed-sample-code-ignore-above
    const [A, setA] = createState(0);

    const B = A.pipe(map((n) => n * 10)); // depth 1

    const D = A.pipe(filter((n) => n % 2 === 0)); // depth 1

    const BD = derive([B, D], (b, d) => [b, d] as const); // depth 2

    const C = BD.pipe(map(([b, d]) => b + d)); // depth 3

    const E = D.pipe(map((n) => n * 10)); // depth 2

    const mut_seen: number[] = [];

    C.subscribe((c) => {
      mut_seen.push(c);
    });

    setA(1); // B = 10, BD = [10, 0], C = 10; D rejects 1, so E is not reached

    setA(2); // B = 20, D = 2, BD = [20, 2], E = 20, C = 22

    assert.deepStrictEqual(mut_seen, [0, 10, 22]);

    assert.strictEqual(E.getSnapshot(), 20);

    // embed-sample-code-ignore-below
  });
}
