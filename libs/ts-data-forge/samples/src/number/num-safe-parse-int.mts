/* eslint-disable math/no-static-nan-calculations */
// Example: src/number/num.mts (Num.safeParseInt)
import { Num, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above

    assert.strictEqual(
      Result.unwrapOkOr(Num.safeParseInt('123'), Number.NaN),
      123,
    );

    assert.strictEqual(
      Result.unwrapOkOr(Num.safeParseInt('12.9'), Number.NaN),
      12,
    );

    assert.strictEqual(
      Result.unwrapOkOr(Num.safeParseInt('-12.9'), Number.NaN),
      -12,
    );

    assert.strictEqual(Number.parseInt('-12.9', 10), -12);

    // Native `parseInt` ignores trailing non-numeric characters

    assert.strictEqual(Number.parseInt('123abc', 10), 123);

    assert.isTrue(Number.isNaN(Number('123abc')));

    assert.isTrue(Result.isErr(Num.safeParseInt('123abc')));

    // Whitespace is not a valid integer, so we return an error instead of coercing to 0.

    assert.isTrue(Number.isNaN(Number.parseInt('  ', 10)));

    assert.strictEqual(Number('  '), 0); // Native `Number` coerces whitespace to 0

    assert.isTrue(Result.isErr(Num.safeParseInt('')));

    assert.strictEqual(Result.unwrapOk(Num.safeParseInt('  ')), undefined);

    // A value that overflows to Infinity is not an integer either, even
    // though native `parseInt` reads a 1 out of it.

    assert.strictEqual(Number.parseInt('1e400', 10), 1);

    assert.isTrue(Result.isErr(Num.safeParseInt('1e400')));

    // embed-sample-code-ignore-below
  });
}
