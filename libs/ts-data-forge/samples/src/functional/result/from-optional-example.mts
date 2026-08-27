// Example: src/functional/result.mts (Result.fromOptional)
import { Optional, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(
      Result.fromOptional(Optional.some(42), 'missing'),
      Result.ok(42),
    );

    assert.deepStrictEqual(
      Result.fromOptional(Optional.none, 'missing'),
      Result.err('missing'),
    );

    const withMissingError = Result.fromOptional('missing');

    assert.deepStrictEqual(withMissingError(Optional.some(1)), Result.ok(1));

    assert.deepStrictEqual(
      withMissingError(Optional.none),
      Result.err('missing'),
    );

    // embed-sample-code-ignore-below
  });
}
