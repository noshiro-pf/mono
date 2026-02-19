import { timer } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(timer, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  Time(ms)  0     ...   1000
    //  delayed$                X (emits and completes)
    //
    //  Explanation:
    //  - timer emits once after the specified delay, then completes
    //  - Useful for delayed actions or timeouts

    const delayed$ = timer(100);

    const mut_history: number[] = [];

    await new Promise<void>((resolve) => {
      delayed$.subscribe(
        () => {
          mut_history.push(1);
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(mut_history, [1]);

    // embed-sample-code-ignore-below
  });
}
