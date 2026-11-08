import { fromAbortablePromise } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('from-abortable-promise', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const mut_aborted: boolean[] = [];

      const request = fromAbortablePromise(
        async (signal) =>
          new Promise<string>((resolve) => {
            const id = setTimeout(() => {
              resolve('done');
            }, 1000);

            signal.addEventListener('abort', () => {
              clearTimeout(id);

              mut_aborted.push(true);
            });
          }),
      );

      // Disposing it, as a `switchMap` does when it moves on, aborts the request.
      request.dispose();

      await vi.advanceTimersByTimeAsync(1000);

      assert.deepStrictEqual(mut_aborted, [true]);

      assert.isFalse(request.hasValue);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
