import { Result } from 'ts-data-forge';
import { SafeNumber } from '../src/index.mjs';

/**
 * Whether calling `fn` throws — used by the equivalence sweeps to compare the
 * wrappers against the raw stdlib APIs over the same inputs.
 */
const throwsError = (fn: () => unknown): boolean => {
  try {
    fn();

    return false;
  } catch {
    return true;
  }
};

const specialValues = [
  1.5,
  0,
  -1.5,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
] as const;

const digitBoundaries = [
  -1,
  -0.5,
  0,
  0.5,
  1,
  99,
  100,
  100.9,
  101,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
] as const;

describe('SafeNumber.toFixed', () => {
  test('returns Ok for fraction digits in range', () => {
    const result = SafeNumber.toFixed(1.005, 2);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '1.00');
  });

  test('returns Ok for the boundary values 0 and 100', () => {
    const lower = SafeNumber.toFixed(1, 0);

    assert.isTrue(Result.isOk(lower));

    assert.deepStrictEqual(lower.value, '1');

    const upper = SafeNumber.toFixed(1, 100);

    assert.isTrue(Result.isOk(upper));
  });

  test('returns a tagged Err for fraction digits out of range', () => {
    const result = SafeNumber.toFixed(1, 101);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'fraction-digits-out-of-range',
      fractionDigits: 101,
    });
  });

  test('returns a tagged Err for negative fraction digits', () => {
    const result = SafeNumber.toFixed(1, -1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'fraction-digits-out-of-range',
      fractionDigits: -1,
    });
  });

  test('truncates fraction digits like ToIntegerOrInfinity (100.9 is legal)', () => {
    const result = SafeNumber.toFixed(1, 100.9);

    assert.isTrue(Result.isOk(result));
  });

  test.each(
    specialValues.flatMap((value) =>
      digitBoundaries.map((fractionDigits) => ({ value, fractionDigits })),
    ),
  )(
    'toFixed($value, $fractionDigits) classifies exactly the raw throws',
    ({ value, fractionDigits }) => {
      const thrown = throwsError(() => value.toFixed(fractionDigits));

      const result = SafeNumber.toFixed(value, fractionDigits);

      assert.deepStrictEqual(Result.isErr(result), thrown);

      // Every engine throw must be classified in advance — 'unexpected'
      // never appears for a spec-defined condition.
      assert.deepStrictEqual(
        Result.isErr(result) && result.value.kind !== 'unexpected',
        thrown,
      );
    },
  );
});

describe('SafeNumber.toExponential', () => {
  test('returns Ok with explicit fraction digits', () => {
    const result = SafeNumber.toExponential(123456, 2);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '1.23e+5');
  });

  test('returns Ok with fraction digits omitted', () => {
    const result = SafeNumber.toExponential(123456);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '1.23456e+5');
  });

  test('returns a tagged Err for fraction digits out of range', () => {
    const result = SafeNumber.toExponential(1, 101);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'fraction-digits-out-of-range',
      fractionDigits: 101,
    });
  });

  test('returns Ok for a non-finite value even with out-of-range digits (the spec checks finiteness first)', () => {
    const nan = SafeNumber.toExponential(Number.NaN, 101);

    assert.isTrue(Result.isOk(nan));

    assert.deepStrictEqual(nan.value, 'NaN');

    const inf = SafeNumber.toExponential(Number.POSITIVE_INFINITY, -1);

    assert.isTrue(Result.isOk(inf));

    assert.deepStrictEqual(inf.value, 'Infinity');
  });

  test.each(
    specialValues.flatMap((value) =>
      digitBoundaries.map((fractionDigits) => ({ value, fractionDigits })),
    ),
  )(
    'toExponential($value, $fractionDigits) classifies exactly the raw throws',
    ({ value, fractionDigits }) => {
      const thrown = throwsError(() => value.toExponential(fractionDigits));

      const result = SafeNumber.toExponential(value, fractionDigits);

      assert.deepStrictEqual(Result.isErr(result), thrown);

      assert.deepStrictEqual(
        Result.isErr(result) && result.value.kind !== 'unexpected',
        thrown,
      );
    },
  );
});

describe('SafeNumber.toPrecision', () => {
  test('returns Ok for precision in range', () => {
    const result = SafeNumber.toPrecision(123.456, 4);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '123.5');
  });

  test('returns a tagged Err for precision out of range', () => {
    const result = SafeNumber.toPrecision(1, 0);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'precision-out-of-range',
      precision: 0,
    });
  });

  test('returns a tagged Err for precision above 100', () => {
    const result = SafeNumber.toPrecision(1, 101);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'precision-out-of-range',
      precision: 101,
    });
  });

  test('returns Ok for a non-finite value even with out-of-range precision (the spec checks finiteness first)', () => {
    const result = SafeNumber.toPrecision(Number.NaN, 0);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'NaN');
  });

  test.each(
    specialValues.flatMap((value) =>
      digitBoundaries.map((precision) => ({ value, precision })),
    ),
  )(
    'toPrecision($value, $precision) classifies exactly the raw throws',
    ({ value, precision }) => {
      const thrown = throwsError(() => value.toPrecision(precision));

      const result = SafeNumber.toPrecision(value, precision);

      assert.deepStrictEqual(Result.isErr(result), thrown);

      assert.deepStrictEqual(
        Result.isErr(result) && result.value.kind !== 'unexpected',
        thrown,
      );
    },
  );
});

describe('SafeNumber.toStringWithRadix', () => {
  test('returns Ok for a radix in range', () => {
    const result = SafeNumber.toStringWithRadix(255, 16);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'ff');
  });

  test('returns Ok for the boundary radixes 2 and 36', () => {
    const binary = SafeNumber.toStringWithRadix(5, 2);

    assert.isTrue(Result.isOk(binary));

    assert.deepStrictEqual(binary.value, '101');

    const base36 = SafeNumber.toStringWithRadix(35, 36);

    assert.isTrue(Result.isOk(base36));

    assert.deepStrictEqual(base36.value, 'z');
  });

  test('returns a tagged Err for a radix out of range', () => {
    const result = SafeNumber.toStringWithRadix(1, 37);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'radix-out-of-range',
      radix: 37,
    });
  });

  test('returns a tagged Err for a radix below 2', () => {
    const result = SafeNumber.toStringWithRadix(1, 1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'radix-out-of-range',
      radix: 1,
    });
  });

  test('checks the radix even for a non-finite value (unlike toExponential / toPrecision)', () => {
    const result = SafeNumber.toStringWithRadix(Number.NaN, 37);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'radix-out-of-range',
      radix: 37,
    });
  });

  test.each(
    specialValues.flatMap((value) =>
      (
        [
          -1,
          0,
          1,
          2,
          2.9,
          10,
          36,
          36.9,
          37,
          Number.NaN,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
        ] as const
      ).map((radix) => ({ value, radix })),
    ),
  )(
    'toStringWithRadix($value, $radix) classifies exactly the raw throws',
    ({ value, radix }) => {
      const thrown = throwsError(() => value.toString(radix));

      const result = SafeNumber.toStringWithRadix(value, radix);

      assert.deepStrictEqual(Result.isErr(result), thrown);

      assert.deepStrictEqual(
        Result.isErr(result) && result.value.kind !== 'unexpected',
        thrown,
      );
    },
  );
});
