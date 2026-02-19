import { fromArray } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(fromArray, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  nums$     1     2     3     | (completes)
    //
    //  Explanation:
    //  - fromArray creates an observable from an array
    //  - Emits all values synchronously, then completes

    const nums$ = fromArray([1, 2, 3]);

    const mut_history: number[] = [];

    await new Promise<void>((resolve) => {
      nums$.subscribe(
        (x) => {
          mut_history.push(x);
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(mut_history, [1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
