import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asSafeInt, SafeInt } from './safe-int.mjs';

describe('SafeInt test', () => {
  describe(asSafeInt, () => {
    test('accepts valid safe integers', () => {
      expect(() => asSafeInt(0)).not.toThrowError();

      expect(() => asSafeInt(1)).not.toThrowError();

      expect(() => asSafeInt(-1)).not.toThrowError();

      expect(() => asSafeInt(42)).not.toThrowError();

      expect(() => asSafeInt(-42)).not.toThrowError();

      expect(() => asSafeInt(Number.MAX_SAFE_INTEGER)).not.toThrowError();

      expect(() => asSafeInt(Number.MIN_SAFE_INTEGER)).not.toThrowError();
    });

    test('rejects values outside safe integer range', () => {
      expect(() => asSafeInt(Number.MAX_SAFE_INTEGER + 1)).toThrowError(
        TypeError,
      );

      expect(() => asSafeInt(Number.MIN_SAFE_INTEGER - 1)).toThrowError(
        TypeError,
      );

      expect(() => asSafeInt(Number.MAX_VALUE)).toThrowError(TypeError);

      expect(() => asSafeInt(-Number.MAX_VALUE)).toThrowError(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asSafeInt(Number.NaN)).toThrowError(TypeError);

      expect(() => asSafeInt(Number.POSITIVE_INFINITY)).toThrowError(TypeError);

      expect(() => asSafeInt(Number.NEGATIVE_INFINITY)).toThrowError(TypeError);

      expect(() => asSafeInt(1.2)).toThrowError(TypeError);

      expect(() => asSafeInt(-3.4)).toThrowError(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asSafeInt(5)).toBe(5);

      expect(asSafeInt(-10)).toBe(-10);

      expect(asSafeInt(0)).toBe(0);

      expect(asSafeInt(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);

      expect(asSafeInt(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
    ] as const)(`asSafeInt($name) should throw a TypeError`, ({ value }) => {
      expect(() => asSafeInt(value)).toThrowError(
        new TypeError(`Expected a safe integer, got: ${value}`),
      );
    });
  });

  describe('SafeInt.is', () => {
    test('correctly identifies safe integers', () => {
      assert.isTrue(SafeInt.is(0));

      assert.isTrue(SafeInt.is(1));

      assert.isTrue(SafeInt.is(-1));

      assert.isTrue(SafeInt.is(42));

      assert.isTrue(SafeInt.is(-42));

      assert.isTrue(SafeInt.is(Number.MAX_SAFE_INTEGER));

      assert.isTrue(SafeInt.is(Number.MIN_SAFE_INTEGER));
    });

    test('correctly identifies values outside safe integer range', () => {
      assert.isFalse(SafeInt.is(Number.MAX_SAFE_INTEGER + 1));

      assert.isFalse(SafeInt.is(Number.MIN_SAFE_INTEGER - 1));

      assert.isFalse(SafeInt.is(Number.MAX_VALUE));

      assert.isFalse(SafeInt.is(-Number.MAX_VALUE));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(SafeInt.is(Number.NaN));

      assert.isFalse(SafeInt.is(Number.POSITIVE_INFINITY));

      assert.isFalse(SafeInt.is(Number.NEGATIVE_INFINITY));

      assert.isFalse(SafeInt.is(1.2));

      assert.isFalse(SafeInt.is(-3.4));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(SafeInt.MIN_VALUE).toBe(Number.MIN_SAFE_INTEGER);

      expect(SafeInt.MAX_VALUE).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('mathematical operations', () => {
    const a = asSafeInt(5);

    const b = asSafeInt(2);

    const c = asSafeInt(-3);

    test('abs', () => {
      expect(SafeInt.abs(a)).toBe(5);

      expect(SafeInt.abs(c)).toBe(3);

      expect(SafeInt.abs(asSafeInt(0))).toBe(0);
    });

    test('min and max', () => {
      expect(SafeInt.min(a, b)).toBe(2);

      expect(SafeInt.max(a, b)).toBe(5);

      expect(SafeInt.min(a, c)).toBe(-3);

      expect(SafeInt.max(a, c)).toBe(5);
    });

    test('add (with clamping to safe integer range)', () => {
      const largeValue = asSafeInt(Number.MAX_SAFE_INTEGER - 1);

      const result = SafeInt.add(largeValue, asSafeInt(10));

      expect(result).toBe(Number.MAX_SAFE_INTEGER); // clamped to max

      expect(SafeInt.add(a, b)).toBe(7);
    });

    test('sub (with clamping to safe integer range)', () => {
      const smallValue = asSafeInt(Number.MIN_SAFE_INTEGER + 1);

      const result = SafeInt.sub(smallValue, asSafeInt(10));

      expect(result).toBe(Number.MIN_SAFE_INTEGER); // clamped to min

      expect(SafeInt.sub(a, b)).toBe(3);
    });

    test('mul (with clamping to safe integer range)', () => {
      const largeValue = asSafeInt(
        Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)),
      );

      const result = SafeInt.mul(largeValue, largeValue);

      expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);

      expect(SafeInt.mul(asSafeInt(10), asSafeInt(5))).toBe(50);
    });

    test('div (floor division with clamping)', () => {
      expect(SafeInt.div(a, b)).toBe(2);

      expect(SafeInt.div(asSafeInt(7), asSafeInt(3))).toBe(2);

      expect(SafeInt.div(asSafeInt(-7), asSafeInt(3))).toBe(-3);
    });

    test('pow (with clamping to safe integer range)', () => {
      const result = SafeInt.pow(asSafeInt(1000), asSafeInt(10));

      expect(result).toBe(Number.MAX_SAFE_INTEGER); // clamped to max

      expect(SafeInt.pow(asSafeInt(2), asSafeInt(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates safe integers within specified range', () => {
      const min = -20;

      const max = 20;

      for (const _ of range(10)) {
        const result = SafeInt.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(SafeInt.is(result));

        assert.isTrue(Number.isInteger(result));
      }
    });

    test('generates values within safe integer range', () => {
      for (const _ of range(10)) {
        const result = SafeInt.random(-30, 30);

        expect(result).toBeGreaterThanOrEqual(Number.MIN_SAFE_INTEGER);

        expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<SafeInt, number>('<=');

      expectTypeOf(asSafeInt(5)).toExtend<SafeInt>();
    });
  });
});
