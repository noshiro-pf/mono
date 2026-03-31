import { source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(source, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  count$    1     2     3     ...
    //
    //  Explanation:
    //  - source creates a new observable that you can manually emit values to
    //  - Use .next() to emit values
    //  - Foundation for building custom observables

    const count$ = source<number>();

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    count$.subscribe((value) => {
      valueHistory.push(value);
    });

    count$.next(1); // logs: 1

    assert.deepStrictEqual(valueHistory, [1]);

    count$.next(2); // logs: 2

    assert.deepStrictEqual(valueHistory, [1, 2]);

    count$.next(3); // logs: 3

    assert.deepStrictEqual(valueHistory, [1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
