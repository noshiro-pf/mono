import { Result } from 'ts-data-forge';
import { SafeNumber } from '../src/index.mjs';

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

  test('returns Err for fraction digits out of range', () => {
    const result = SafeNumber.toFixed(1, 101);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });

  test('returns Err for negative fraction digits', () => {
    const result = SafeNumber.toFixed(1, -1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
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

  test('returns Err for fraction digits out of range', () => {
    const result = SafeNumber.toExponential(1, 101);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
});

describe('SafeNumber.toPrecision', () => {
  test('returns Ok for precision in range', () => {
    const result = SafeNumber.toPrecision(123.456, 4);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '123.5');
  });

  test('returns Err for precision out of range', () => {
    const result = SafeNumber.toPrecision(1, 0);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });

  test('returns Err for precision above 100', () => {
    const result = SafeNumber.toPrecision(1, 101);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
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

  test('returns Err for a radix out of range', () => {
    const result = SafeNumber.toStringWithRadix(1, 37);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });

  test('returns Err for a radix below 2', () => {
    const result = SafeNumber.toStringWithRadix(1, 1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
});
