// Example: src/functional/result.mts (Result.unwrapThrow)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = Result.ok('data');

    const errResult = Result.err(new Error('fail'));

    assert.isTrue(Result.unwrapThrow(okResult) === 'data');

    assert.throws(() => Result.unwrapThrow(errResult), Error, 'fail');

    // embed-sample-code-ignore-below
  });
}
