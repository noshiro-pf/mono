/* eslint-disable unicorn/consistent-function-scoping */
import { debounce, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(debounce, async () => {
    // embed-sample-code-ignore-above

    //  Timeline (250ms debounce):
    //
    //  Time(x50ms)  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
    //
    //  input$       0       2   3                   9   10  11  12  13  14
    //                               |- 250ms ->                         |- 250ms ->
    //  debounced$                   3                                             14   (emitted after 250ms silence)
    //
    //  Explanation:
    //  - debounce emits the latest value AFTER a quiet period with no new emissions
    //  - Unlike audit (which uses a fixed window), debounce resets the timer on every emission
    //  - Useful for search-as-you-type and form validation

    const input$ = source<number>();

    const debounced$ = input$.pipe(debounce(250));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    debounced$.subscribe((value) => {
      valueHistory.push(value);
    });

    const sleep = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

    input$.next(0);

    await sleep(200);

    input$.next(2);

    await sleep(100);

    input$.next(3);

    assert.deepStrictEqual(valueHistory, []);

    await sleep(300);

    assert.deepStrictEqual(valueHistory, [3]);

    await sleep(300);

    input$.next(9);

    await sleep(100);

    input$.next(10);

    await sleep(100);

    input$.next(11);

    await sleep(100);

    input$.next(12);

    await sleep(100);

    input$.next(13);

    await sleep(100);

    input$.next(14);

    assert.deepStrictEqual(valueHistory, [3]);

    await sleep(300);

    assert.deepStrictEqual(valueHistory, [3, 14]);

    // embed-sample-code-ignore-below
  });
}
