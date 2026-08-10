import { collectToArray, combine, counter, filter, map, take } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('filter-diamond-example', async () => {
    // embed-sample-code-ignore-above

    const A = counter(1000);
    // 0, 1, 2, 3, 4, ...

    const B = A.pipe(map((n) => n * 10));
    // 0, 10, 20, 30, 40, ...

    const D = A.pipe(filter((n) => n % 2 === 0));
    // 0, 2, 4, ...  (odd values are skipped)

    const C = combine([B, D]).pipe(map(([b, d]) => b + d));
    // sum of B and D: 0, 10, 22, 32, 44, 54, 66, ...

    const E = D.pipe(map((n) => n * 10));
    // 0, 20, 40, ...

    const resultC = collectToArray(C.pipe(take(7)));

    const resultE = collectToArray(E.pipe(take(4)));

    // embed-sample-code-ignore-below

    A.start();

    assert.deepStrictEqual(await resultC, [0, 10, 22, 32, 44, 54, 66]);

    assert.deepStrictEqual(await resultE, [0, 20, 40, 60]);
  });
}
