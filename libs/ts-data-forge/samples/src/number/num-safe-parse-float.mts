// Example: src/number/num.mts (Num.safeParseInt)
import { Num, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above

    assert.strictEqual(
      Result.unwrapOkOr(Num.safeParseFloat('12.9'), Number.NaN),
      12.9,
    );

    assert.strictEqual(
      Result.unwrapOkOr(Num.safeParseFloat('-3.5'), Number.NaN),
      -3.5,
    );

    assert.strictEqual(
      Result.unwrapOkOr(Num.safeParseFloat('1e3'), Number.NaN),
      1000,
    );

    // Native `parseFloat` ignores trailing non-numeric characters

    assert.strictEqual(Number.parseFloat('12px'), 12);

    assert.isTrue(Result.isErr(Num.safeParseFloat('12px')));

    // Whitespace is not a valid number, so we return an error instead of coercing to 0.

    assert.isTrue(Result.isErr(Num.safeParseFloat('')));

    assert.isTrue(Result.isErr(Num.safeParseFloat('   ')));

    // Infinity and NaN are not finite, so they are rejected.

    assert.isTrue(Result.isErr(Num.safeParseFloat('Infinity')));

    assert.isTrue(Result.isErr(Num.safeParseFloat('NaN')));

    // embed-sample-code-ignore-below
  });
}
