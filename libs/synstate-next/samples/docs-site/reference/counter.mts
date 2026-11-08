import { counter } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('counter', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const mut_ticks: number[] = [];

      counter(100, { times: 3 }).subscribe((n) => {
        mut_ticks.push(n);
      });

      await vi.advanceTimersByTimeAsync(1000);

      // 0 at once, then one every 100 ms, three values in all.
      assert.deepStrictEqual(mut_ticks, [0, 1, 2]);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
