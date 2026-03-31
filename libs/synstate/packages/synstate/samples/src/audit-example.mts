/* eslint-disable unicorn/consistent-function-scoping */
import { audit, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(audit, async () => {
    // embed-sample-code-ignore-above

    //  Timeline (250ms audit):
    //
    //  Time(x50ms)  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
    //
    //  input$       0       2   3                   9   10  11  12  13  14
    //               |- 250ms -> |- 250ms ->         |- 250ms -> |- 250ms ->
    //  audited$               2           3                   11          14   (emitted at end of window)
    //
    //  Explanation:
    //  - audit emits the LAST value received during each time window
    //  - Unlike throttle (which emits the FIRST value), audit emits the LAST
    //  - Useful when you want the most recent value after a burst of events

    const input$ = source<number>();

    const audited$ = input$.pipe(audit(250));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    audited$.subscribe((value) => {
      valueHistory.push(value);
    });

    const sleep = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

    input$.next(0);

    await sleep(200);

    input$.next(2);

    assert.deepStrictEqual(valueHistory, []);

    await sleep(100);

    assert.deepStrictEqual(valueHistory, [2]);

    input$.next(3);

    await sleep(300);

    assert.deepStrictEqual(valueHistory, [2, 3]);

    await sleep(300);

    input$.next(9);

    await sleep(100);

    input$.next(10);

    await sleep(100);

    input$.next(11);

    assert.deepStrictEqual(valueHistory, [2, 3]);

    await sleep(100);

    assert.deepStrictEqual(valueHistory, [2, 3, 11]);

    input$.next(12);

    await sleep(100);

    input$.next(13);

    assert.deepStrictEqual(valueHistory, [2, 3, 11]);

    await sleep(100);

    input$.next(14);

    assert.deepStrictEqual(valueHistory, [2, 3, 11]);

    await sleep(100);

    assert.deepStrictEqual(valueHistory, [2, 3, 11, 14]);

    // embed-sample-code-ignore-below
  });
}
