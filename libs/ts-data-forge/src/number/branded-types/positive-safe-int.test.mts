import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveSafeInt,
  isPositiveSafeInt,
  PositiveSafeInt,
} from './positive-safe-int.mjs';

describe('PositiveSafeInt', () => {
  describe('asPositiveSafeInt', () => {
    test('accepts valid positive safe integers', () => {
      expect(() => asPositiveSafeInt(1)).not.toThrow();
      expect(() => asPositiveSafeInt(2)).not.toThrow();
      expect(() => asPositiveSafeInt(42)).not.toThrow();
      expect(() => asPositiveSafeInt(100)).not.toThrow();
      expect(() => asPositiveSafeInt(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects zero', () => {
      expect(() => asPositiveSafeInt(0)).toThrow(TypeError);
      expect(() => asPositiveSafeInt(-0)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveSafeInt(-1)).toThrow(TypeError);
      expect(() => asPositiveSafeInt(-42)).toThrow(TypeError);
      expect(() => asPositiveSafeInt(Number.MIN_SAFE_INTEGER)).toThrow(
        TypeError,
      );
    });

    test('rejects values outside safe integer range', () => {
      expect(() => asPositiveSafeInt(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        TypeError,
      );
      expect(() => asPositiveSafeInt(Number.MAX_VALUE)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveSafeInt(Number.NaN)).toThrow(TypeError);
      expect(() => asPositiveSafeInt(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asPositiveSafeInt(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asPositiveSafeInt(1.2)).toThrow(TypeError);
      expect(() => asPositiveSafeInt(-3.4)).toThrow(TypeError);
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
        expect(() => asPositiveSafeInt(value)).toThrow(
          new TypeError(`Expected a positive safe integer, got: ${value}`),
        );
      },
    );
  });

  describe('isPositiveSafeInt', () => {
    test('correctly identifies positive safe integers', () => {
      expect(isPositiveSafeInt(1)).toBe(true);
      expect(isPositiveSafeInt(2)).toBe(true);
      expect(isPositiveSafeInt(42)).toBe(true);
      expect(isPositiveSafeInt(100)).toBe(true);
      expect(isPositiveSafeInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isPositiveSafeInt(0)).toBe(false);
      expect(isPositiveSafeInt(-0)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isPositiveSafeInt(-1)).toBe(false);
      expect(isPositiveSafeInt(-42)).toBe(false);
      expect(isPositiveSafeInt(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    test('correctly identifies values outside safe integer range', () => {
      expect(isPositiveSafeInt(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
      expect(isPositiveSafeInt(Number.MAX_VALUE)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isPositiveSafeInt(Number.NaN)).toBe(false);
      expect(isPositiveSafeInt(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isPositiveSafeInt(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isPositiveSafeInt(1.2)).toBe(false);
      expect(isPositiveSafeInt(-3.4)).toBe(false);
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
        expect(PositiveSafeInt.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
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
