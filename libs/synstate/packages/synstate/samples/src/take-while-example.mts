import { source, takeWhile } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(takeWhile, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      1     2     3     4     5     6 (ignored)
    //  taken$    1     2     3     4     | (completes)
    //
    //  Explanation:
    //  - takeWhile emits values while the predicate returns true
    //  - Completes immediately when the predicate returns false
    //  - No further values are emitted after completion

    const num$ = source<number>();

    const taken$ = num$.pipe(takeWhile((x) => x < 5));

    const mut_history: number[] = [];

    taken$.subscribe((x) => {
      mut_history.push(x);
    });

    num$.next(1); // logs: 1

    assert.deepStrictEqual(mut_history, [1]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(mut_history, [1, 2]);

    num$.next(5); // nothing logged (completes)

    assert.deepStrictEqual(mut_history, [1, 2]);

    num$.next(6); // nothing logged (already completed)

    assert.deepStrictEqual(mut_history, [1, 2]);

    // embed-sample-code-ignore-below
  });
}
