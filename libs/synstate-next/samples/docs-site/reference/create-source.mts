import { createSource, type Observable } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-source', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const everyFrame = (milliseconds: number): Observable<number> =>
        createSource<number>((ctx) => {
          let mut_frame = 0;

          const id = setInterval(() => {
            mut_frame += 1;

            ctx.emit(mut_frame);
          }, milliseconds);

          ctx.onCleanup(() => {
            clearInterval(id);
          });
        });

      const frames = everyFrame(16);

      await vi.advanceTimersByTimeAsync(50);

      assert.strictEqual(frames.getSnapshot(), 3);

      // Disposing it runs the cleanup, which clears the interval.
      frames.dispose();

      await vi.advanceTimersByTimeAsync(50);

      assert.strictEqual(frames.getSnapshot(), 3);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
