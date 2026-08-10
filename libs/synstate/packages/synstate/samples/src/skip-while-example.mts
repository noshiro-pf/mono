import { skipWhile, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(skipWhile, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$        1     2     3     4     5     6     7     1     2
    //  skipped$                            5     6     7     1     2
    //              |-------- skip --------|
    //
    //  Explanation:
    //  - skipWhile skips values while the predicate returns true
    //  - Once the predicate returns false, all subsequent values pass through
    //  - Unlike filter, the predicate is never checked again after the first false

    const num$ = source<number>();

    const skipped$ = num$.pipe(skipWhile((x) => x < 5));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    skipped$.subscribe((x) => {
      valueHistory.push(x);
    });

    num$.next(1); // nothing logged

    num$.next(2); // nothing logged

    num$.next(3); // nothing logged

    num$.next(4); // nothing logged

    num$.next(5); // logs: 5

    assert.deepStrictEqual(valueHistory, [5]);

    num$.next(6); // logs: 6

    assert.deepStrictEqual(valueHistory, [5, 6]);

    num$.next(7); // logs: 7

    assert.deepStrictEqual(valueHistory, [5, 6, 7]);

    num$.next(1); // logs: 1

    num$.next(2); // logs: 2

    assert.deepStrictEqual(valueHistory, [5, 6, 7, 1, 2]);

    // embed-sample-code-ignore-below
  });
}
