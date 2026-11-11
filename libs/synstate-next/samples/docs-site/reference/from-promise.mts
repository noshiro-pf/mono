import { fromPromise } from 'synstate-next';
import { Optional, Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('from-promise', async () => {
    vi.useFakeTimers();

    try {
      // embed-sample-code-ignore-above
      const answer = fromPromise(Promise.resolve(42));

      // Nothing until the promise settles.
      assert.isTrue(Optional.isNone(answer.getSnapshot()));

      await vi.advanceTimersByTimeAsync(0);

      assert.deepStrictEqual(
        answer.getSnapshot(),
        Optional.some(Result.ok(42)),
      );

      const failed = fromPromise<number, Error>(
        Promise.reject(new Error('down')),
      );

      await vi.advanceTimersByTimeAsync(0);

      assert.isTrue(
        Result.isErr(Optional.unwrapOr(failed.getSnapshot(), Result.ok(0))),
      );

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
