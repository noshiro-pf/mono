import { source, take } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(take, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$    1     2     3     4 (ignored)
    //  taken$  1     2     3     | (completes)
    //
    //  Explanation:
    //  - take emits only the first n values, then completes
    //  - Subsequent emissions from the source are ignored

    const num$ = source<number>();

    const taken$ = num$.pipe(take(3));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    taken$.subscribe((x) => {
      valueHistory.push(x);
    });

    num$.next(1);

    num$.next(2);

    num$.next(3);

    assert.deepStrictEqual(valueHistory, [1, 2, 3]);

    num$.next(4); // ignored (already completed)

    assert.deepStrictEqual(valueHistory, [1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
