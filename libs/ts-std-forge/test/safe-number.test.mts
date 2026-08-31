import { SafeNumber } from '../src/index.mjs';

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
