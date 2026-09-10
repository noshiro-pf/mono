// Example: src/functional/async-result.mts (AsyncResult.fromThrowable)
import { isError } from '@sindresorhus/is';
import { AsyncResult, Result, unknownToString } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const success = await AsyncResult.fromThrowable(
      () => Promise.resolve(2),
      (error) => `failed: ${unknownToString(error)}`,
    );

    const failure = await AsyncResult.fromThrowable(
      (): Promise<number> => {
        throw new Error('boom');
      },
      (error) => (isError(error) ? error.message : 'unknown'),
    );

    assert.deepStrictEqual(success, Result.ok(2));

    assert.deepStrictEqual(failure, Result.err('boom'));

    // Without `mapError`, the thrown value is carried as-is.
    const untyped = await AsyncResult.fromThrowable((): Promise<number> => {
      throw new Error('boom');
    });

    assert.isTrue(Result.isErr(untyped));

    // embed-sample-code-ignore-below
  });
}
