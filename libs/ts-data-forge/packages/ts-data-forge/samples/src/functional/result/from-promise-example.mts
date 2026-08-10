// Example: src/functional/result.mts (Result.fromPromise)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', async () => {
    // embed-sample-code-ignore-above
    const successPromise = Result.fromPromise(Promise.resolve('ok'));

    const failurePromise = Result.fromPromise(
      Promise.reject(new Error('fail')),
    );

    const resolved = await successPromise;

    const rejected = await failurePromise;

    assert.deepStrictEqual(resolved, Result.ok('ok'));

    assert.isTrue(Result.isErr(rejected));

    // embed-sample-code-ignore-below
  });
}
