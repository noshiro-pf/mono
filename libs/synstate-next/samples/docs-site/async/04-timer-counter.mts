import { counter, createRootOwner, timer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('timer and counter', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const owner = createRootOwner();

      const mut_ticks: number[] = [];

      owner.run(() => {
        // Starts now, where it is created, and belongs to `owner`.
        const ticks = counter(1000);

        ticks.subscribe((n) => {
          mut_ticks.push(n);
        });

        // Emits `0` once, after 500 ms, and settles.
        const delay = timer(500);

        delay.subscribe(() => {
          mut_ticks.push(-1);
        });
      });

      await vi.advanceTimersByTimeAsync(2500);

      assert.deepStrictEqual(mut_ticks, [0, -1, 1, 2]);

      // Disposing the owner clears the counter's timer.
      owner.dispose();

      await vi.advanceTimersByTimeAsync(5000);

      assert.deepStrictEqual(mut_ticks, [0, -1, 1, 2]);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
