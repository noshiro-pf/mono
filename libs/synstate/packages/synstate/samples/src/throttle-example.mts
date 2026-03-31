/* eslint-disable unicorn/consistent-function-scoping */
import { source, throttle } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(throttle, async () => {
    // embed-sample-code-ignore-above

    //  Timeline (250ms throttle):
    //
    //  Time(x50ms)  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
    //
    //  input$       0       2   3                   9   10  11  12  13  14
    //               |- 250ms -> |- 250ms ->         |- 250ms ->    |- 250ms ->
    //  throttled$   0           3                   9          12           (emitted at start of window)
    //
    //  Explanation:
    //  - throttle emits the FIRST value received, then ignores subsequent values
    //    for the specified duration (250ms)
    //  - Unlike audit (which emits the LAST value), throttle emits the FIRST
    //  - Useful for rate-limiting scroll/resize events

    const input$ = source<number>();

    const throttled$ = input$.pipe(throttle(250));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    throttled$.subscribe((value) => {
      valueHistory.push(value);
    });

    const sleep = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

    input$.next(0);

    assert.deepStrictEqual(valueHistory, [0]);

    await sleep(200);

    input$.next(2);

    assert.deepStrictEqual(valueHistory, [0]);

    await sleep(100);

    input$.next(3);

    assert.deepStrictEqual(valueHistory, [0, 3]);

    await sleep(300);

    input$.next(9);

    assert.deepStrictEqual(valueHistory, [0, 3, 9]);

    await sleep(100);

    input$.next(10);

    await sleep(100);

    input$.next(11);

    assert.deepStrictEqual(valueHistory, [0, 3, 9]);

    await sleep(100);

    input$.next(12);

    assert.deepStrictEqual(valueHistory, [0, 3, 9, 12]);

    // embed-sample-code-ignore-below
  });
}
