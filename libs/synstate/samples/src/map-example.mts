import { map, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(map, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      1   3   4   6   7
    //  parity$   1       0       1
    //
    //  Explanation:
    //  - map transforms each value
    //  - A result equal to the one held is not emitted

    const num$ = source<number>();

    const parity$ = num$.pipe(map((x) => x % 2));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    parity$.subscribe((p) => {
      valueHistory.push(p);
    });

    num$.next(1); // 1

    num$.next(3); // still 1: not emitted

    num$.next(4); // 0

    num$.next(6); // still 0: not emitted

    num$.next(7); // 1

    assert.deepStrictEqual(valueHistory, [1, 0, 1]);

    // embed-sample-code-ignore-below
  });
}
