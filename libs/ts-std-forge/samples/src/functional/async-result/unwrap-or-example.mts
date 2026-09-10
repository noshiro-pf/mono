// Example: src/functional/async-result.mts (AsyncResult.unwrapOr)
import { AsyncResult } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const okValue = AsyncResult.fromPromise(
      Promise.resolve(10),
      () => 'failed',
    );

    const errValue = AsyncResult.fromPromise(
      Promise.reject(new Error('boom')),
      () => 'failed',
    );

    assert.isTrue((await AsyncResult.unwrapOr(okValue, 0)) === 10);

    assert.isTrue((await AsyncResult.unwrapOr(errValue, 0)) === 0);

    // embed-sample-code-ignore-below
  });
}
