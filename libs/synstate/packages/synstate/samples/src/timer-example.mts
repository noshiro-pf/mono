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

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    await new Promise<void>((resolve) => {
      delayed$.subscribe(
        () => {
          valueHistory.push(1);
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(valueHistory, [1]);

    // embed-sample-code-ignore-below
  });
}
