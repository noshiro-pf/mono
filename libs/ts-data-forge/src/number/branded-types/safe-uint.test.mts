import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asSafeUint, isSafeUint, SafeUint } from './safe-uint.mjs';

describe('SafeUint test', () => {
  describe(asSafeUint, () => {
    test('accepts valid safe unsigned integers', () => {
      expect(() => asSafeUint(0)).not.toThrowError();

      expect(() => asSafeUint(1)).not.toThrowError();

      expect(() => asSafeUint(42)).not.toThrowError();

      expect(() => asSafeUint(100)).not.toThrowError();

      expect(() => asSafeUint(Number.MAX_SAFE_INTEGER)).not.toThrowError();
    });

    test('rejects negative numbers', () => {
      expect(() => asSafeUint(-1)).toThrowError(TypeError);

      expect(() => asSafeUint(-42)).toThrowError(TypeError);

      expect(() => asSafeUint(Number.MIN_SAFE_INTEGER)).toThrowError(TypeError);
    });

    test('rejects values outside safe integer range', () => {
      expect(() => asSafeUint(Number.MAX_SAFE_INTEGER + 1)).toThrowError(
        TypeError,
      );

      expect(() => asSafeUint(Number.MAX_VALUE)).toThrowError(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asSafeUint(Number.NaN)).toThrowError(TypeError);

      expect(() => asSafeUint(Number.POSITIVE_INFINITY)).toThrowError(
        TypeError,
      );

      expect(() => asSafeUint(Number.NEGATIVE_INFINITY)).toThrowError(
        TypeError,
      );

      expect(() => asSafeUint(1.2)).toThrowError(TypeError);

      expect(() => asSafeUint(-3.4)).toThrowError(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asSafeUint(5)).toBe(5);

      expect(asSafeUint(0)).toBe(0);

      expect(asSafeUint(10)).toBe(10);

      expect(asSafeUint(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '-1', value: -1 },
    ] as const)(`asSafeUint($name) should throw a TypeError`, ({ value }) => {
      expect(() => asSafeUint(value)).toThrowError(
        new TypeError(`Expected a non-negative safe integer, got: ${value}`),
      );
    });
  });

  describe(isSafeUint, () => {
    test('correctly identifies safe unsigned integers', () => {
      assert.isTrue(isSafeUint(0));

      assert.isTrue(isSafeUint(1));

      assert.isTrue(isSafeUint(42));

      assert.isTrue(isSafeUint(100));

      assert.isTrue(isSafeUint(Number.MAX_SAFE_INTEGER));
    });

    test('correctly identifies negative numbers', () => {
      assert.isFalse(isSafeUint(-1));

      assert.isFalse(isSafeUint(-42));

      assert.isFalse(isSafeUint(Number.MIN_SAFE_INTEGER));
    });

    test('correctly identifies values outside safe integer range', () => {
      assert.isFalse(isSafeUint(Number.MAX_SAFE_INTEGER + 1));

      assert.isFalse(isSafeUint(Number.MAX_VALUE));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isSafeUint(Number.NaN));

      assert.isFalse(isSafeUint(Number.POSITIVE_INFINITY));

      assert.isFalse(isSafeUint(Number.NEGATIVE_INFINITY));

      assert.isFalse(isSafeUint(1.2));

      assert.isFalse(isSafeUint(-3.4));
    });
  });

  describe('SafeUint.is', () => {
    test('same as isSafeUint function', () => {
      expect(SafeUint.is(5)).toBe(isSafeUint(5));

      expect(SafeUint.is(-1)).toBe(isSafeUint(-1));

      expect(SafeUint.is(0)).toBe(isSafeUint(0));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(SafeUint.MIN_VALUE).toBe(0);

      expect(SafeUint.MAX_VALUE).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('mathematical operations', () => {
    const a = asSafeUint(5);

    const b = asSafeUint(2);

    const c = asSafeUint(0);

    test('min and max', () => {
      expect(SafeUint.min(a, b)).toBe(2);

      expect(SafeUint.max(a, b)).toBe(5);

      expect(SafeUint.min(a, c)).toBe(0);

      expect(SafeUint.max(a, c)).toBe(5);
    });

    test('add (clamped to safe uint range)', () => {
      const largeValue = asSafeUint(Number.MAX_SAFE_INTEGER - 1);

      const result = SafeUint.add(largeValue, asSafeUint(10));

      expect(result).toBe(Number.MAX_SAFE_INTEGER); // clamped to max

      expect(SafeUint.add(a, b)).toBe(7);
    });

    test('sub (never goes below 0)', () => {
      expect(SafeUint.sub(a, b)).toBe(3);

      expect(SafeUint.sub(b, a)).toBe(0); // clamped to 0

      expect(SafeUint.sub(c, a)).toBe(0); // clamped to 0
    });

    test('mul (clamped to safe uint range)', () => {
      const largeValue = asSafeUint(
        Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)),
      );

      const result = SafeUint.mul(largeValue, largeValue);

      expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);

      expect(SafeUint.mul(asSafeUint(10), asSafeUint(5))).toBe(50);
    });

    test('div (floor division, never goes below 0)', () => {
      expect(SafeUint.div(a, b)).toBe(2);

      expect(SafeUint.div(asSafeUint(7), asSafeUint(3))).toBe(2);

      expect(SafeUint.div(b, a)).toBe(0); // floor(2/5) = 0
    });

    test('pow (clamped to safe uint range)', () => {
      const result = SafeUint.pow(asSafeUint(1000), asSafeUint(10));

      expect(result).toBe(Number.MAX_SAFE_INTEGER); // clamped to max

      expect(SafeUint.pow(asSafeUint(2), asSafeUint(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates safe unsigned integers within specified range', () => {
      const min = 0;

      const max = 20;

      for (const _ of range(10)) {
        const result = SafeUint.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(SafeUint.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates values within safe uint range', () => {
      for (const _ of range(10)) {
        const result = SafeUint.random(0, 30);

        expect(result).toBeGreaterThanOrEqual(0);

        expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<SafeUint, number>('<=');

      expectTypeOf(asSafeUint(5)).toExtend<SafeUint>();
    });
  });
});
