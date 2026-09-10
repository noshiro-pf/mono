// Example: src/functional/async-result.mts (AsyncResult.fromPromise)
import { isError } from '@sindresorhus/is';
import { AsyncResult, Result, unknownToString } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const resolved = await AsyncResult.fromPromise(
      Promise.resolve('ok'),
      (error) => `failed: ${unknownToString(error)}`,
    );

    const rejected = await AsyncResult.fromPromise(
      Promise.reject(new Error('boom')),
      (error) => (isError(error) ? error.message : 'unknown'),
    );

    assert.deepStrictEqual(resolved, Result.ok('ok'));

    assert.deepStrictEqual(rejected, Result.err('boom'));

    // Without `mapError`, the rejection reason is carried as-is.
    const untyped = await AsyncResult.fromPromise(
      Promise.reject(new Error('boom')),
    );

    assert.isTrue(Result.isErr(untyped));

    // embed-sample-code-ignore-below
  });
}
