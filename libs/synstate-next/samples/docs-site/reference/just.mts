import { createState, just, map, switchMap, timer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('just', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [delayed, setDelayed] = createState(false);

      const label = delayed.pipe(
        switchMap((d) =>
          // A branch with nothing to wait for.
          d ? timer(500).pipe(map(() => 'later')) : just('now'),
        ),
      );

      assert.strictEqual(label.peek(), 'now');

      setDelayed(true);

      await vi.advanceTimersByTimeAsync(500);

      assert.strictEqual(label.peek(), 'later');

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
