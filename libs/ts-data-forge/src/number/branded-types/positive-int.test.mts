import { expectType } from '../../expect-type.mjs';
import { asPositiveInt, isPositiveInt, PositiveInt } from './positive-int.mjs';

describe('PositiveInt', () => {
  describe('asPositiveInt', () => {
    test('accepts valid positive integers', () => {
      expect(() => asPositiveInt(1)).not.toThrow();
      expect(() => asPositiveInt(2)).not.toThrow();
      expect(() => asPositiveInt(42)).not.toThrow();
      expect(() => asPositiveInt(100)).not.toThrow();
      expect(() => asPositiveInt(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects zero', () => {
      expect(() => asPositiveInt(0)).toThrow(TypeError);
      expect(() => asPositiveInt(-0)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveInt(-1)).toThrow(TypeError);
      expect(() => asPositiveInt(-42)).toThrow(TypeError);
      expect(() => asPositiveInt(Number.MIN_SAFE_INTEGER)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveInt(Number.NaN)).toThrow(TypeError);
      expect(() => asPositiveInt(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asPositiveInt(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
      expect(() => asPositiveInt(1.2)).toThrow(TypeError);
      expect(() => asPositiveInt(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveInt(5)).toBe(5);
      expect(asPositiveInt(1)).toBe(1);
      expect(asPositiveInt(10)).toBe(10);
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
      `asPositiveInt($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveInt(value)).toThrow(
          new TypeError(`Expected a positive integer, got: ${value}`),
        );
      },
    );
  });

  describe('isPositiveInt', () => {
    test('correctly identifies positive integers', () => {
      expect(isPositiveInt(1)).toBe(true);
      expect(isPositiveInt(2)).toBe(true);
      expect(isPositiveInt(42)).toBe(true);
      expect(isPositiveInt(100)).toBe(true);
      expect(isPositiveInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isPositiveInt(0)).toBe(false);
      expect(isPositiveInt(-0)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isPositiveInt(-1)).toBe(false);
      expect(isPositiveInt(-42)).toBe(false);
      expect(isPositiveInt(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isPositiveInt(Number.NaN)).toBe(false);
      expect(isPositiveInt(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isPositiveInt(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isPositiveInt(1.2)).toBe(false);
      expect(isPositiveInt(-3.4)).toBe(false);
    });
  });

  describe('PositiveInt.is', () => {
    test('same as isPositiveInt function', () => {
      expect(PositiveInt.is(5)).toBe(isPositiveInt(5));
      expect(PositiveInt.is(0)).toBe(isPositiveInt(0));
      expect(PositiveInt.is(-10)).toBe(isPositiveInt(-10));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE', () => {
      expect(PositiveInt.MIN_VALUE).toBe(1);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveInt(5);
    const b = asPositiveInt(2);
    const c = asPositiveInt(1);

    test('min and max', () => {
      expect(PositiveInt.min(a, b)).toBe(2);
      expect(PositiveInt.max(a, b)).toBe(5);
      expect(PositiveInt.min(a, c)).toBe(1);
      expect(PositiveInt.max(a, c)).toBe(5);
    });

    test('add (never goes below 1)', () => {
      expect(PositiveInt.add(a, b)).toBe(7);
      expect(PositiveInt.add(a, c)).toBe(6);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveInt.sub(a, b)).toBe(3);
      expect(PositiveInt.sub(b, a)).toBe(1); // clamped to 1
      expect(PositiveInt.sub(c, a)).toBe(1); // clamped to 1
    });

    test('mul (never goes below 1)', () => {
      expect(PositiveInt.mul(a, b)).toBe(10);
      expect(PositiveInt.mul(a, c)).toBe(5);
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveInt.div(a, b)).toBe(2);
      expect(PositiveInt.div(asPositiveInt(7), asPositiveInt(3))).toBe(2);
      expect(PositiveInt.div(b, a)).toBe(1); // floor(2/5) = 0, but clamped to 1
    });

    test('pow (never goes below 1)', () => {
      expect(PositiveInt.pow(asPositiveInt(2), asPositiveInt(3))).toBe(8);
      expect(PositiveInt.pow(asPositiveInt(3), asPositiveInt(2))).toBe(9);
      expect(PositiveInt.pow(asPositiveInt(5), asPositiveInt(1))).toBe(5);
    });
  });

  describe('random', () => {
    test('generates positive integers within specified range', () => {
      const min = 1;
      const max = 10;

      for (let i = 0; i < 10; i++) {
        const result = PositiveInt.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(PositiveInt.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates integers starting from 1', () => {
      const min = 1;
      const max = 5;

      for (let i = 0; i < 10; i++) {
        const result = PositiveInt.random(min, max);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(5);
        expect(result).toBeGreaterThan(0);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveInt, number>('<=');

      expectTypeOf(asPositiveInt(5)).toExtend<PositiveInt>();
    });
  });
});
