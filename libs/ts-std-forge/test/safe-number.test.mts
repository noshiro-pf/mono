import { Num, Result } from 'ts-data-forge';
import { SafeNumber } from '../src/index.mjs';

// Inputs shared by the equivalence sweeps against the ts-data-forge
// implementations that parse / parseInt mirror.
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

const specialValues = [
  1.5,
  0,
  -1.5,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
] as const;

describe('SafeNumber.toFixed', () => {
  test('returns the fixed-point representation', () => {
    assert.deepStrictEqual(SafeNumber.toFixed(1.005, 2), '1.00');
  });

  test('accepts the boundary digits 0 and 100', () => {
    assert.deepStrictEqual(SafeNumber.toFixed(1, 0), '1');

    assert.deepStrictEqual(SafeNumber.toFixed(1, 100), (1).toFixed(100));
  });

  test.each(specialValues.map((value) => ({ value })))(
    'toFixed($value, 2) matches the raw API (non-finite values do not throw)',
    ({ value }) => {
      assert.deepStrictEqual(SafeNumber.toFixed(value, 2), value.toFixed(2));
    },
  );

  test('throws like the raw API when the type-level guard is bypassed', () => {
    // The `0 | 1 | ... | 100` parameter type is the whole guarantee: an
    // out-of-range digit count is a compile-time error, and a caller that
    // defeats the type system gets the raw RangeError. There is no runtime
    // safety net by design (D-26).
    expect(() =>
      // @ts-expect-error -- deliberately passing out-of-range digits
      SafeNumber.toFixed(1, 101),
    ).toThrow(RangeError);
  });
});

describe('SafeNumber.toExponential', () => {
  test('returns the exponential representation with explicit digits', () => {
    assert.deepStrictEqual(SafeNumber.toExponential(123456, 2), '1.23e+5');
  });

  test('uses as many digits as necessary when digits are omitted', () => {
    assert.deepStrictEqual(SafeNumber.toExponential(123456), '1.23456e+5');
  });

  test('accepts the boundary digits 0 and 100', () => {
    assert.deepStrictEqual(
      SafeNumber.toExponential(1, 0),
      (1).toExponential(0),
    );

    assert.deepStrictEqual(
      SafeNumber.toExponential(1, 100),
      (1).toExponential(100),
    );
  });

  test.each(specialValues.map((value) => ({ value })))(
    'toExponential($value, 2) matches the raw API',
    ({ value }) => {
      assert.deepStrictEqual(
        SafeNumber.toExponential(value, 2),
        value.toExponential(2),
      );
    },
  );

  test('throws like the raw API when the type-level guard is bypassed', () => {
    expect(() =>
      // @ts-expect-error -- deliberately passing out-of-range digits
      SafeNumber.toExponential(1, 101),
    ).toThrow(RangeError);
  });
});

describe('SafeNumber.toPrecision', () => {
  test('returns the formatted representation', () => {
    assert.deepStrictEqual(SafeNumber.toPrecision(123.456, 4), '123.5');
  });

  test('accepts the boundary precisions 1 and 100', () => {
    assert.deepStrictEqual(SafeNumber.toPrecision(1, 1), '1');

    assert.deepStrictEqual(
      SafeNumber.toPrecision(1, 100),
      (1).toPrecision(100),
    );
  });

  test.each(specialValues.map((value) => ({ value })))(
    'toPrecision($value, 4) matches the raw API',
    ({ value }) => {
      assert.deepStrictEqual(
        SafeNumber.toPrecision(value, 4),
        value.toPrecision(4),
      );
    },
  );

  test('throws like the raw API when the type-level guard is bypassed', () => {
    expect(() =>
      // @ts-expect-error -- deliberately passing out-of-range precision
      SafeNumber.toPrecision(1, 0),
    ).toThrow(RangeError);
  });
});

describe('SafeNumber.toStringWithRadix', () => {
  test('returns the representation in the given radix', () => {
    assert.deepStrictEqual(SafeNumber.toStringWithRadix(255, 16), 'ff');
  });

  test('accepts the boundary radixes 2 and 36', () => {
    assert.deepStrictEqual(SafeNumber.toStringWithRadix(5, 2), '101');

    assert.deepStrictEqual(SafeNumber.toStringWithRadix(35, 36), 'z');
  });

  test.each(specialValues.map((value) => ({ value })))(
    'toStringWithRadix($value, 16) matches the raw API',
    ({ value }) => {
      assert.deepStrictEqual(
        SafeNumber.toStringWithRadix(value, 16),
        value.toString(16),
      );
    },
  );

  test('throws like the raw API when the type-level guard is bypassed', () => {
    expect(() =>
      // @ts-expect-error -- deliberately passing an out-of-range radix
      SafeNumber.toStringWithRadix(1, 37),
    ).toThrow(RangeError);
  });
});

describe('SafeNumber.parse', () => {
  test.each([
    { input: '42', expected: 42 },
    { input: '2.5', expected: 2.5 },
    { input: '-1e3', expected: -1000 },
    { input: '0x10', expected: 16 },
    { input: '  12  ', expected: 12 },
  ])('parse($input) returns Ok($expected)', ({ input, expected }) => {
    const result = SafeNumber.parse(input);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, expected);
  });

  test.each([
    { input: '' },
    { input: ' '.repeat(3) },
    { input: 'abc' },
    { input: '12px' },
    { input: '1_000' },
    { input: 'NaN' },
    { input: 'Infinity' },
    { input: '1e400' },
  ])('parse($input) returns a tagged Err', ({ input }) => {
    const result = SafeNumber.parse(input);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, { kind: 'invalid-number', input });
  });

  test.each(parseSweep.map((input) => ({ input })))(
    'parse($input) accepts exactly what Num.safeParseFloat accepts',
    ({ input }) => {
      const result = SafeNumber.parse(input);

      const reference = Num.safeParseFloat(input);

      assert.deepStrictEqual(Result.isOk(result), Result.isOk(reference));

      assert.deepStrictEqual(
        Result.unwrapOkOr(result, undefined),
        Result.unwrapOkOr(reference, undefined),
      );
    },
  );
});

describe('SafeNumber.parseInteger', () => {
  test.each([
    { input: '42', expected: 42 },
    { input: '-12.9', expected: -12 },
    { input: '1e3', expected: 1000 },
    { input: '0x10', expected: 16 },
    { input: '  12  ', expected: 12 },
  ])('parseInteger($input) returns Ok($expected)', ({ input, expected }) => {
    const result = SafeNumber.parseInteger(input);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, expected);
  });

  test.each([
    { input: '' },
    { input: ' '.repeat(3) },
    { input: 'abc' },
    { input: '123abc' },
    { input: 'NaN' },
    { input: 'Infinity' },
  ])('parseInteger($input) returns a tagged Err', ({ input }) => {
    const result = SafeNumber.parseInteger(input);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, { kind: 'invalid-integer', input });
  });

  test('rejects a non-finite value that Num.safeParseInt lets through', () => {
    // Number('1e400') is Infinity while parseInt('1e400', 10) is 1, so the
    // agreement check alone accepts it; the copy adds a finiteness check.
    assert.isTrue(Result.isErr(SafeNumber.parseInteger('1e400')));

    assert.deepStrictEqual(
      Result.unwrapOkOr(Num.safeParseInt('1e400'), undefined),
      Number.POSITIVE_INFINITY,
    );
  });

  test.each(
    parseSweep.filter((input) => input !== '1e400').map((input) => ({ input })),
  )(
    'parseInteger($input) accepts exactly what Num.safeParseInt accepts',
    ({ input }) => {
      const result = SafeNumber.parseInteger(input);

      const reference = Num.safeParseInt(input);

      assert.deepStrictEqual(Result.isOk(result), Result.isOk(reference));

      assert.deepStrictEqual(
        Result.unwrapOkOr(result, undefined),
        Result.unwrapOkOr(reference, undefined),
      );
    },
  );
});
