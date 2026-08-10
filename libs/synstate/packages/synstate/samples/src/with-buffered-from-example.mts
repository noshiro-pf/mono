import { source, withBufferedFrom } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(withBufferedFrom, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  data$       d1    d2    d3    d4    d5    d6    d7    d8
    //  trigger$                T1                T2                T3
    //  result$                 [T1,[d1,d2,d3]]   [T2,[d4,d5,d6]]   [T3,[d7,d8]]
    //
    //  Explanation:
    //  - withBufferedFrom collects values from the source observable
    //  - When the trigger emits, it emits a tuple of [triggerValue, bufferedValues]
    //  - Buffer is cleared after each emission
    //  - Useful for batching data collection triggered by events

    const data$ = source<string>();

    const trigger$ = source<number>();

    const result$ = trigger$.pipe(withBufferedFrom(data$));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (readonly [number, readonly string[]])[] = [];

    result$.subscribe(([triggerValue, bufferedData]) => {
      valueHistory.push([triggerValue, bufferedData]);
    });

    data$.next('A');

    data$.next('B');

    trigger$.next(1);

    assert.deepStrictEqual(valueHistory, [[1, ['A', 'B']]]);

    data$.next('C');

    trigger$.next(2);

    assert.deepStrictEqual(valueHistory, [
      [1, ['A', 'B']],
      [2, ['C']],
    ]);

    // embed-sample-code-ignore-below
  });
}
