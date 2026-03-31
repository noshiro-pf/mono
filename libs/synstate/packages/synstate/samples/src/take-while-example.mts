import { source, takeWhile } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(takeWhile, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      1     2     3     4     5     6     1     2 (ignored)
    //  taken$    1     2     3     4     | (completes)
    //
    //  Explanation:
    //  - takeWhile emits values while the predicate returns true
    //  - Completes immediately when the predicate returns false
    //  - No further values are emitted after completion

    const num$ = source<number>();

    const taken$ = num$.pipe(takeWhile((x) => x < 5));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    taken$.subscribe((x) => {
      valueHistory.push(x);
    });

    num$.next(1); // logs: 1

    assert.deepStrictEqual(valueHistory, [1]);

    num$.next(2); // logs: 2

    num$.next(3); // logs: 3

    num$.next(4); // logs: 4

    assert.deepStrictEqual(valueHistory, [1, 2, 3, 4]);

    num$.next(5); // nothing logged (completes)

    assert.deepStrictEqual(valueHistory, [1, 2, 3, 4]);

    num$.next(6); // nothing logged (already completed)

    assert.deepStrictEqual(valueHistory, [1, 2, 3, 4]);

    num$.next(1); // logs: 1

    assert.deepStrictEqual(valueHistory, [1, 2, 3, 4]);

    // embed-sample-code-ignore-below
  });
}
