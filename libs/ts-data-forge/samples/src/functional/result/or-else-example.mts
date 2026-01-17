// Example: src/functional/result.mts (Result.orElse)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const primary = Result.ok('primary');

    const fallback = Result.ok('fallback');

    const failure = Result.err('failure');

    assert.deepStrictEqual(Result.orElse(primary, fallback), primary);

    assert.deepStrictEqual(Result.orElse(failure, fallback), fallback);

    const orElseFallback = Result.orElse(Result.ok('default'));

    assert.deepStrictEqual(
      orElseFallback(Result.err('missing')),
      Result.ok('default'),
    );

    assert.deepStrictEqual(
      orElseFallback(Result.ok('value')),
      Result.ok('value'),
    );

    // embed-sample-code-ignore-below
  });
}
