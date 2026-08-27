// Example: src/functional/result.mts (Result.safeUnwrap)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const result = Result.safeTry(function* () {
      const x = yield* Result.safeUnwrap(Result.ok(2));

      const y = yield* Result.safeUnwrap(Result.ok(3));

      return Result.ok(x + y);
    });

    assert.deepStrictEqual(result, Result.ok(5));

    // embed-sample-code-ignore-below
  });
}
