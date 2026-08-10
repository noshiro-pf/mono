import { skipIfNoChange, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(skipIfNoChange, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      1     1     2     2     1     2     3     2
    //  distinct$ 1           2           1     2     3     2
    //
    //  Explanation:
    //  - skipIfNoChange filters out consecutive duplicate values
    //  - Uses strict equality (===) for comparison
    //  - Only emits when the value actually changes

    const num$ = source<number>();

    const distinct$ = num$.pipe(skipIfNoChange());

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    distinct$.subscribe((x) => {
      valueHistory.push(x);
    });

    num$.next(1); // logs: 1

    assert.deepStrictEqual(valueHistory, [1]);

    num$.next(1); // nothing logged

    assert.deepStrictEqual(valueHistory, [1]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(valueHistory, [1, 2]);

    num$.next(2); // nothing logged

    num$.next(1); // logs: 1

    assert.deepStrictEqual(valueHistory, [1, 2, 1]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(valueHistory, [1, 2, 1, 2]);

    num$.next(3); // logs: 3

    assert.deepStrictEqual(valueHistory, [1, 2, 1, 2, 3]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(valueHistory, [1, 2, 1, 2, 3, 2]);

    // embed-sample-code-ignore-below
  });
}
