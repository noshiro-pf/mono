import { interval } from 'synstate';
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(interval, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  Time(s)   0     1     2     3     4     5
    //  tick$     0     1     2     3     4     5     ...
    //
    //  Explanation:
    //  - interval emits incrementing numbers at specified intervals
    //  - Starts at 0 and continues indefinitely
    //  - Useful for periodic tasks or animations

    const tick$ = interval(100);

    const mut_history: number[] = [];

    const subscription = tick$.subscribe((count) => {
      mut_history.push(count);
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    subscription.unsubscribe();

    assert.isTrue(Arr.isArrayAtLeastLength(mut_history, 3));

    assert.deepStrictEqual(mut_history[0], 0);

    assert.deepStrictEqual(mut_history[1], 1);

    assert.deepStrictEqual(mut_history[2], 2);

    // embed-sample-code-ignore-below
  });
}
