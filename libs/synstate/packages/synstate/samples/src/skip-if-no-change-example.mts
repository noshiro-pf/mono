import { skipIfNoChange, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(skipIfNoChange, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      1     1     2     2     2     3
    //  distinct$ 1           2                 3
    //
    //  Explanation:
    //  - skipIfNoChange filters out consecutive duplicate values
    //  - Uses strict equality (===) for comparison
    //  - Only emits when the value actually changes

    const num$ = source<number>();

    const distinct$ = num$.pipe(skipIfNoChange());

    const mut_history: number[] = [];

    distinct$.subscribe((x) => {
      mut_history.push(x);
    });

    num$.next(1); // logs: 1

    assert.deepStrictEqual(mut_history, [1]);

    num$.next(1); // nothing logged

    assert.deepStrictEqual(mut_history, [1]);

    num$.next(2); // logs: 2

    assert.deepStrictEqual(mut_history, [1, 2]);

    num$.next(2); // nothing logged

    num$.next(3); // logs: 3

    assert.deepStrictEqual(mut_history, [1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
