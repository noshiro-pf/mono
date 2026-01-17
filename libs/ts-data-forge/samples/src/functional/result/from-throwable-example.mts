// Example: src/functional/result.mts (Result.fromThrowable)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const success = Result.fromThrowable(() => 1 + 1);

    const failure = Result.fromThrowable(() => {
      throw new Error('boom');
    });

    assert.deepStrictEqual(success, Result.ok(2));

    assert.isTrue(Result.isErr(failure));

    // embed-sample-code-ignore-below
  });
}
