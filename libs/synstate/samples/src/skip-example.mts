import { skip, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(skip, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      1     2     3     4     5
    //  skipped$              3     4     5
    //            |skip 2|
    //
    //  Explanation:
    //  - skip ignores the first n emissions from the source
    //  - After n values are skipped, all subsequent values pass through

    const num$ = source<number>();

    const skipped$ = num$.pipe(skip(2));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    skipped$.subscribe((x) => {
      valueHistory.push(x);
    });

    num$.next(1); // skipped

    num$.next(2); // skipped

    assert.deepStrictEqual(valueHistory, []);

    num$.next(3); // logs: 3

    assert.deepStrictEqual(valueHistory, [3]);

    num$.next(4); // logs: 4

    num$.next(5); // logs: 5

    assert.deepStrictEqual(valueHistory, [3, 4, 5]);

    // embed-sample-code-ignore-below
  });
}
