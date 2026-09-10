// Example: src/functional/async-result.mts (AsyncResult.mapErr)
import { AsyncResult, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const errValue = AsyncResult.fromPromise(
      Promise.reject(new Error('boom')),
      () => 'failure',
    );

    const uppercased = await AsyncResult.mapErr(errValue, (error) =>
      error.toUpperCase(),
    );

    assert.deepStrictEqual(uppercased, Result.err('FAILURE'));

    // embed-sample-code-ignore-below
  });
}
