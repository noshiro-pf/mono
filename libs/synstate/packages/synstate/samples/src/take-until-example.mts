import { createEventEmitter, source, takeUntil } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(takeUntil, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$          1         2         stop      3 (ignored)
    //  stopNotifier                      X
    //  limited$      1         2         |------- (completed)
    //
    //  Explanation:
    //  - takeUntil completes the observable when the notifier emits
    //  - After stop() is called, no further values are emitted
    //  - Useful for cleanup and cancellation patterns

    const num$ = source<number>();

    const [stopNotifier, stop_] = createEventEmitter();

    const limited$ = num$.pipe(takeUntil(stopNotifier));

    const mut_history: number[] = [];

    limited$.subscribe((x) => {
      mut_history.push(x);
    });

    num$.next(1); // logs: 1

    assert.deepStrictEqual(mut_history, [1]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(mut_history, [1, 2]);

    stop_();

    num$.next(3); // nothing logged (completed)

    assert.deepStrictEqual(mut_history, [1, 2]);

    // embed-sample-code-ignore-below
  });
}
