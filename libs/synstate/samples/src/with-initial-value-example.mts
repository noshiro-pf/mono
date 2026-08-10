import { source, withInitialValue } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(withInitialValue, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$             1    2    3
    //  withInitial$ 0   1    2    3
    //               ^
    //               initial value
    //
    //  Explanation:
    //  - withInitialValue provides an initial value before the source emits
    //  - Converts an uninitialized observable to an initialized one
    //  - Useful when you need a default value immediately

    const num$ = source<number>();

    const initialized$ = num$.pipe(withInitialValue(0));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    initialized$.subscribe((x) => {
      valueHistory.push(x);
    });

    assert.deepStrictEqual(valueHistory, [0]);

    num$.next(1); // logs: 1

    assert.deepStrictEqual(valueHistory, [0, 1]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(valueHistory, [0, 1, 2]);

    // embed-sample-code-ignore-below
  });
}
