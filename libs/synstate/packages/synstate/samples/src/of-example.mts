import { of } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(of, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$    42  | (completes immediately)
    //
    //  Explanation:
    //  - of creates an observable that emits a single value, then completes
    //  - Useful for converting a static value into an observable

    const num$ = of(42);

    const mut_history: number[] = [];

    await new Promise<void>((resolve) => {
      num$.subscribe(
        (x) => {
          mut_history.push(x);
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(mut_history, [42]);

    // embed-sample-code-ignore-below
  });
}
