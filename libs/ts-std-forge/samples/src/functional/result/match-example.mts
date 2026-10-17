// Example: src/functional/result.mts (Result.match)
import { Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const doubledOrZero = Result.match(Result.ok(21), {
      ok: (value) => value * 2,
      err: () => 0,
    });

    assert.strictEqual(doubledOrZero, 42);

    const matcher = Result.match({
      ok: (value: number) => value + 1,
      err: (error: string) => error.length,
    });

    assert.strictEqual(matcher(Result.ok(1)), 2);

    assert.strictEqual(matcher(Result.err('oops')), 4);

    // embed-sample-code-ignore-below
  });
}
