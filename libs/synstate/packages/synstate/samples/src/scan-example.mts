import { scan, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(scan, () => {
    // embed-sample-code-ignore-above

    //  Timeline (accumulating sum):
    //
    //  num$    1     2     3     4     5
    //  sum$    1     3     6     10    15
    //          |     |     |     |     |
    //          0+1   1+2   3+3   6+4   10+5
    //
    //  Explanation:
    //  - scan accumulates values over time using a reducer function
    //  - Starting with seed value 0, each emission adds to the accumulator
    //  - Similar to Array.reduce, but for streams

    const num$ = source<number>();

    const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));

    const mut_history: number[] = [];

    sum$.subscribe((x) => {
      mut_history.push(x);
    });

    assert.deepStrictEqual(mut_history, [0]);

    num$.next(1); // logs: 1

    assert.deepStrictEqual(mut_history, [0, 1]);

    num$.next(2); // logs: 3

    assert.deepStrictEqual(mut_history, [0, 1, 3]);

    num$.next(3); // logs: 6

    assert.deepStrictEqual(mut_history, [0, 1, 3, 6]);

    // embed-sample-code-ignore-below
  });
}
