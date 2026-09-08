import { SafeNumber } from 'ts-std-forge';
import { Num, Result } from '../src/entry-point.mjs';

/**
 * The one seam left between the two packages, checked from this side because
 * the dependency runs this way (Sumi D-49).
 *
 * `Num.safeParseFloat` and `Num.safeParseInt` delegate to `SafeNumber.parse`
 * and `SafeNumber.parseInteger` and add their own contract on top: the brand
 * on the success side, an `Error` rather than a tagged record on the failure
 * side. These cases pin that.
 *
 * Everything else the two packages share — `PanicError` and the ADT core — is
 * one implementation re-exported from here, and is tested where it lives.
 */

// Inputs that separate the traps: whitespace and blank input, which `Number`
// coerces to 0; trailing garbage, which `parseInt` accepts; and `1e400`,
// which `Number` turns into Infinity while `parseInt` reads as 1.
const parseSweep = [
  '42',
  '-12.9',
  '1e3',
  '1e400',
  '0x10',
  '0b101',
  '.5',
  '5.',
  '-0',
  '',
  ' ',
  'abc',
  '12px',
  '123abc',
  'NaN',
  'Infinity',
  '-Infinity',
] as const;

describe('Num.safeParseFloat is SafeNumber.parse plus a brand', () => {
  test.each(parseSweep.map((input) => ({ input })))(
    'agrees with SafeNumber.parse on $input',
    ({ input }) => {
      const viaNum = Num.safeParseFloat(input);

      const viaSafeNumber = SafeNumber.parse(input);

      assert.deepStrictEqual(Result.isOk(viaNum), Result.isOk(viaSafeNumber));

      assert.deepStrictEqual(
        Result.unwrapOkOr(viaNum, undefined),
        Result.unwrapOkOr(viaSafeNumber, undefined),
      );
    },
  );

  test('reports the failure as an Error, not as a tagged record', () => {
    const failed = Num.safeParseFloat('abc');

    assert.isTrue(Result.isErr(failed));

    assert.isTrue(Error.isError(failed.value));

    assert.strictEqual(
      failed.value.message,
      'safeParseFloat: "abc" is not a valid finite number',
    );
  });
});

describe('Num.safeParseInt is SafeNumber.parseInteger plus a brand', () => {
  test.each(parseSweep.map((input) => ({ input })))(
    'agrees with SafeNumber.parseInteger on $input',
    ({ input }) => {
      const viaNum = Num.safeParseInt(input);

      const viaSafeNumber = SafeNumber.parseInteger(input);

      assert.deepStrictEqual(Result.isOk(viaNum), Result.isOk(viaSafeNumber));

      assert.deepStrictEqual(
        Result.unwrapOkOr(viaNum, undefined),
        Result.unwrapOkOr(viaSafeNumber, undefined),
      );
    },
  );

  test('rejects a value that is not finite', () => {
    // `Number('1e400')` is Infinity while `parseInt('1e400', 10)` is 1, so
    // requiring only that the two agree would let Infinity through as an
    // `Int`. Delegating to `SafeNumber.parseInteger`, which also checks
    // finiteness, closed that hole (Sumi D-49 (c)).
    assert.isTrue(Result.isErr(Num.safeParseInt('1e400')));
  });

  test('reports the failure as an Error, not as a tagged record', () => {
    const failed = Num.safeParseInt('abc');

    assert.isTrue(Result.isErr(failed));

    assert.isTrue(Error.isError(failed.value));

    assert.strictEqual(
      failed.value.message,
      'safeParseInt: "abc" is not a valid base-10 integer',
    );
  });
});
