import { createValueEmitter, throttle } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('throttle', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [scrolled, scroll] = createValueEmitter<number>();

      const mut_seen: number[] = [];

      scrolled.pipe(throttle(100)).subscribe((y) => {
        mut_seen.push(y);
      });

      scroll(10);

      scroll(20);

      await vi.advanceTimersByTimeAsync(100);

      scroll(30);

      // The first value of each window passes; the rest are dropped.
      assert.deepStrictEqual(mut_seen, [10, 30]);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
