import { auditTime, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(auditTime, async () => {
    // embed-sample-code-ignore-above

    //  Timeline (1000ms audit):
    //
    //  Time(ms)  0    100   200   300   400   ...   1000  1100
    //  input$    e1   e2    e3    e4    e5
    //  audited$                                      e5 (emitted at end of window)
    //            |-------1000ms window------>        ^
    //
    //  Explanation:
    //  - auditTime emits the LAST value received during each time window
    //  - Unlike throttleTime (which emits the FIRST value), audit emits the LAST
    //  - At 0-1000ms: e1-e5 are received
    //  - At 1000ms: e5 (the last value in the window) is emitted
    //  - Useful when you want the most recent value after a burst of events

    const input$ = source<number>();

    const audited$ = input$.pipe(auditTime(200));

    const mut_history: number[] = [];

    audited$.subscribe((value) => {
      mut_history.push(value);
    });

    input$.next(1);

    input$.next(2);

    input$.next(3);

    assert.deepStrictEqual(mut_history, []);

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    assert.deepStrictEqual(mut_history, [3]);

    input$.next(4);

    input$.next(5);

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    assert.deepStrictEqual(mut_history, [3, 5]);

    // embed-sample-code-ignore-below
  });
}
