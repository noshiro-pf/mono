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

    const mut_history: (readonly [number, readonly string[]])[] = [];

    result$.subscribe(([triggerValue, bufferedData]) => {
      mut_history.push([triggerValue, bufferedData]);
    });

    data$.next('a');

    data$.next('b');

    trigger$.next(1);

    assert.deepStrictEqual(mut_history, [[1, ['a', 'b']]]);

    data$.next('c');

    trigger$.next(2);

    assert.deepStrictEqual(mut_history, [
      [1, ['a', 'b']],
      [2, ['c']],
    ]);

    // embed-sample-code-ignore-below
  });
}
