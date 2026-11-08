import { counter, createState, empty, switchMap } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('empty', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [running, setRunning] = createState(true);

      const ticks = running.pipe(
        // While paused, follow nothing: the last tick is kept.
        switchMap((r) => (r ? counter(100) : empty<number>())),
      );

      await vi.advanceTimersByTimeAsync(250);

      setRunning(false);

      await vi.advanceTimersByTimeAsync(1000);

      assert.strictEqual(ticks.peek(), 2);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
