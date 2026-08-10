import { counter } from 'synstate';
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(counter, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  Time(s)   0     1     2     3     4     5
    //  tick$     0     1     2     3     4     5     ...
    //
    //  Explanation:
    //  - counter emits incrementing numbers at specified intervals
    //  - Starts at 0 and continues indefinitely
    //  - Useful for periodic tasks or animations

    const tick$ = counter(100);

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    const subscription = tick$.subscribe((count) => {
      valueHistory.push(count);
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    subscription.unsubscribe();

    assert.isTrue(Arr.isMinLengthArray(3, valueHistory));

    assert.deepStrictEqual(valueHistory[0], 0);

    assert.deepStrictEqual(valueHistory[1], 1);

    assert.deepStrictEqual(valueHistory[2], 2);

    // embed-sample-code-ignore-below
  });
}
