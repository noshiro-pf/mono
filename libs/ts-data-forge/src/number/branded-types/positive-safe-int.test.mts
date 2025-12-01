import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveSafeInt,
  isPositiveSafeInt,
  PositiveSafeInt,
} from './positive-safe-int.mjs';

describe('PositiveSafeInt test', () => {
  describe(asPositiveSafeInt, () => {
    test('accepts valid positive safe integers', () => {
      expect(() => asPositiveSafeInt(1)).not.toThrowError();

      expect(() => asPositiveSafeInt(2)).not.toThrowError();

      expect(() => asPositiveSafeInt(42)).not.toThrowError();

      expect(() => asPositiveSafeInt(100)).not.toThrowError();

      expect(() =>
        asPositiveSafeInt(Number.MAX_SAFE_INTEGER),
      ).not.toThrowError();
    });

    test('rejects zero', () => {
      expect(() => asPositiveSafeInt(0)).toThrowError(TypeError);

      expect(() => asPositiveSafeInt(-0)).toThrowError(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveSafeInt(-1)).toThrowError(TypeError);

      expect(() => asPositiveSafeInt(-42)).toThrowError(TypeError);

      expect(() => asPositiveSafeInt(Number.MIN_SAFE_INTEGER)).toThrowError(
        TypeError,
      );
    });

    test('rejects values outside safe integer range', () => {
      expect(() => asPositiveSafeInt(Number.MAX_SAFE_INTEGER + 1)).toThrowError(
        TypeError,
      );

      expect(() => asPositiveSafeInt(Number.MAX_VALUE)).toThrowError(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveSafeInt(Number.NaN)).toThrowError(TypeError);

      expect(() => asPositiveSafeInt(Number.POSITIVE_INFINITY)).toThrowError(
        TypeError,
      );

      expect(() => asPositiveSafeInt(Number.NEGATIVE_INFINITY)).toThrowError(
        TypeError,
      );

      expect(() => asPositiveSafeInt(1.2)).toThrowError(TypeError);

      expect(() => asPositiveSafeInt(-3.4)).toThrowError(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveSafeInt(5)).toBe(5);

      expect(asPositiveSafeInt(1)).toBe(1);

      expect(asPositiveSafeInt(10)).toBe(10);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
    ] as const)(
      `asPositiveSafeInt($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveSafeInt(value)).toThrowError(
          new TypeError(`Expected a positive safe integer, got: ${value}`),
        );
      },
    );
  });

  describe(isPositiveSafeInt, () => {
    test('correctly identifies positive safe integers', () => {
      assert.isTrue(isPositiveSafeInt(1));

      assert.isTrue(isPositiveSafeInt(2));

      assert.isTrue(isPositiveSafeInt(42));

      assert.isTrue(isPositiveSafeInt(100));

      assert.isTrue(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isPositiveSafeInt(0));

      assert.isFalse(isPositiveSafeInt(-0));
    });

    test('correctly identifies negative integers', () => {
      assert.isFalse(isPositiveSafeInt(-1));

      assert.isFalse(isPositiveSafeInt(-42));

      assert.isFalse(isPositiveSafeInt(Number.MIN_SAFE_INTEGER));
    });

    test('correctly identifies values outside safe integer range', () => {
      assert.isFalse(isPositiveSafeInt(Number.MAX_SAFE_INTEGER + 1));

      assert.isFalse(isPositiveSafeInt(Number.MAX_VALUE));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isPositiveSafeInt(Number.NaN));

      assert.isFalse(isPositiveSafeInt(Number.POSITIVE_INFINITY));

      assert.isFalse(isPositiveSafeInt(Number.NEGATIVE_INFINITY));

      assert.isFalse(isPositiveSafeInt(1.2));

      assert.isFalse(isPositiveSafeInt(-3.4));
    });
  });

  describe('PositiveSafeInt.is', () => {
    test('same as isPositiveSafeInt function', () => {
      expect(PositiveSafeInt.is(5)).toBe(isPositiveSafeInt(5));

      expect(PositiveSafeInt.is(0)).toBe(isPositiveSafeInt(0));

      expect(PositiveSafeInt.is(-10)).toBe(isPositiveSafeInt(-10));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(PositiveSafeInt.MIN_VALUE).toBe(1);

      expect(PositiveSafeInt.MAX_VALUE).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveSafeInt(5);

    const b = asPositiveSafeInt(2);

    const c = asPositiveSafeInt(1);

    test('min and max', () => {
      expect(PositiveSafeInt.min(a, b)).toBe(2);

      expect(PositiveSafeInt.max(a, b)).toBe(5);

      expect(PositiveSafeInt.min(a, c)).toBe(1);

      expect(PositiveSafeInt.max(a, c)).toBe(5);
    });

    test('add (clamped to positive safe int range)', () => {
      const largeValue = asPositiveSafeInt(Number.MAX_SAFE_INTEGER - 1);

      const result = PositiveSafeInt.add(largeValue, asPositiveSafeInt(10));

      expect(result).toBe(Number.MAX_SAFE_INTEGER); // clamped to max

      expect(PositiveSafeInt.add(a, b)).toBe(7);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveSafeInt.sub(a, b)).toBe(3);

      expect(PositiveSafeInt.sub(b, a)).toBe(1); // clamped to 1

      expect(PositiveSafeInt.sub(c, a)).toBe(1); // clamped to 1
    });

    test('mul (clamped to positive safe int range)', () => {
      const largeValue = asPositiveSafeInt(
        Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)),
      );

      const result = PositiveSafeInt.mul(largeValue, largeValue);

      expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);

      expect(
        PositiveSafeInt.mul(asPositiveSafeInt(10), asPositiveSafeInt(5)),
      ).toBe(50);
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveSafeInt.div(a, b)).toBe(2);

      expect(
        PositiveSafeInt.div(asPositiveSafeInt(7), asPositiveSafeInt(3)),
      ).toBe(2);

      expect(PositiveSafeInt.div(b, a)).toBe(1); // floor(2/5) = 0, but clamped to 1
    });

    test('pow (clamped to positive safe int range)', () => {
      const result = PositiveSafeInt.pow(
        asPositiveSafeInt(1000),
        asPositiveSafeInt(10),
      );

      expect(result).toBe(Number.MAX_SAFE_INTEGER); // clamped to max

      expect(
        PositiveSafeInt.pow(asPositiveSafeInt(2), asPositiveSafeInt(3)),
      ).toBe(8);
    });
  });

  describe('random', () => {
    test('generates positive safe integers within specified range', () => {
      const min = 1;

      const max = 20;

      for (const _ of range(10)) {
        const result = PositiveSafeInt.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(PositiveSafeInt.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates values within positive safe int range', () => {
      for (const _ of range(10)) {
        const result = PositiveSafeInt.random(1, 30);

        expect(result).toBeGreaterThanOrEqual(1);

        expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveSafeInt, number>('<=');

      expectTypeOf(asPositiveSafeInt(5)).toExtend<PositiveSafeInt>();
    });
  });
});
