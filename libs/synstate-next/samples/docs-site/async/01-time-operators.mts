import { audit, debounce, source, throttle } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('debounce, throttle and audit', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const keys = source<string>();

      const mut_debounced: string[] = [];

      const mut_throttled: string[] = [];

      const mut_audited: string[] = [];

      // The last value, once 100 ms pass without another.
      keys.pipe(debounce(100)).subscribe((k) => {
        mut_debounced.push(k);
      });

      // The first value at once, then nothing for 100 ms.
      keys.pipe(throttle(100)).subscribe((k) => {
        mut_throttled.push(k);
      });

      // The latest value, 100 ms after the first of a burst.
      keys.pipe(audit(100)).subscribe((k) => {
        mut_audited.push(k);
      });

      keys.next('a');

      await vi.advanceTimersByTimeAsync(40);

      keys.next('b');

      await vi.advanceTimersByTimeAsync(40);

      keys.next('c');

      await vi.advanceTimersByTimeAsync(200);

      assert.deepStrictEqual(mut_debounced, ['c']);

      assert.deepStrictEqual(mut_throttled, ['a']);

      assert.deepStrictEqual(mut_audited, ['c']);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
