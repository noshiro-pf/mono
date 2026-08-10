import { createEventEmitter, skipUntil, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(skipUntil, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$          1     2     3     start   4     5     6
    //  startNotifier                   X
    //  skipped$                                4     5     6
    //                |------ skipped -------|
    //
    //  Explanation:
    //  - skipUntil ignores all values until the notifier emits
    //  - After the notifier emits, all subsequent values are passed through
    //  - Opposite of takeUntil (which completes when notifier emits)

    const num$ = source<number>();

    const [startNotifier, start_] = createEventEmitter();

    const skipped$ = num$.pipe(skipUntil(startNotifier));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    skipped$.subscribe((x) => {
      valueHistory.push(x);
    });

    num$.next(1); // nothing logged

    num$.next(2); // nothing logged

    assert.deepStrictEqual(valueHistory, []);

    start_();

    num$.next(4); // logs: 4

    assert.deepStrictEqual(valueHistory, [4]);

    num$.next(5); // logs: 5

    assert.deepStrictEqual(valueHistory, [4, 5]);

    // embed-sample-code-ignore-below
  });
}
