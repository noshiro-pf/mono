import { audit, createValueEmitter } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('audit', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const [resized, resize] = createValueEmitter<number>();

      const mut_seen: number[] = [];

      resized.pipe(audit(100)).subscribe((width) => {
        mut_seen.push(width);
      });

      resize(300);

      resize(320);

      resize(340);

      await vi.advanceTimersByTimeAsync(100);

      // The latest value, 100 ms after the first.
      assert.deepStrictEqual(mut_seen, [340]);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
