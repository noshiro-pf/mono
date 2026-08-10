import { mapTo, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(mapTo, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  click$    MouseEvent   MouseEvent   MouseEvent
    //  count$    1            1            1
    //
    //  Explanation:
    //  - mapTo maps all emitted values to a constant value
    //  - Ignores the source values entirely
    //  - Useful for converting events to signals

    const click$ = source<string>();

    const one$ = click$.pipe(mapTo(1));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    one$.subscribe((value) => {
      valueHistory.push(value);
    });

    click$.next('click1');

    click$.next('click2');

    click$.next('click3');

    assert.deepStrictEqual(valueHistory, [1, 1, 1]);

    // embed-sample-code-ignore-below
  });
}
