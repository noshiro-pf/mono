import { timer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('timer', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const mut_fired: number[] = [];

      timer(300).subscribe((n) => {
        mut_fired.push(n);
      });

      await vi.advanceTimersByTimeAsync(299);

      assert.deepStrictEqual(mut_fired, []);

      await vi.advanceTimersByTimeAsync(1);

      assert.deepStrictEqual(mut_fired, [0]);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
