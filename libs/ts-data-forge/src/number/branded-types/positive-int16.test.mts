import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveInt16,
  isPositiveInt16,
  PositiveInt16,
} from './positive-int16.mjs';

describe('PositiveInt16', () => {
  describe('asPositiveInt16', () => {
    test('accepts valid positive int16 values', () => {
      expect(() => asPositiveInt16(1)).not.toThrow();
      expect(() => asPositiveInt16(1000)).not.toThrow();
      expect(() => asPositiveInt16(32767)).not.toThrow(); // 2^15 - 1
    });

    test('rejects zero', () => {
      expect(() => asPositiveInt16(0)).toThrow(TypeError);
    });

    test('rejects values outside int16 range', () => {
      expect(() => asPositiveInt16(32768)).toThrow(TypeError); // 2^15
      expect(() => asPositiveInt16(65536)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveInt16(-1)).toThrow(TypeError);
      expect(() => asPositiveInt16(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveInt16(Number.NaN)).toThrow(TypeError);
      expect(() => asPositiveInt16(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asPositiveInt16(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asPositiveInt16(1.2)).toThrow(TypeError);
      expect(() => asPositiveInt16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveInt16(5)).toBe(5);
      expect(asPositiveInt16(1)).toBe(1);
      expect(asPositiveInt16(32767)).toBe(32767);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '32768', value: 32768 },
    ] as const)(
      `asPositiveInt16($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveInt16(value)).toThrow(
          new TypeError(
            `Expected a positive integer in [1, 2^15), got: ${value}`,
          ),
        );
      },
    );
  });

  describe('isPositiveInt16', () => {
    test('correctly identifies positive int16 values', () => {
      expect(isPositiveInt16(1)).toBe(true);
      expect(isPositiveInt16(1000)).toBe(true);
      expect(isPositiveInt16(32767)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isPositiveInt16(0)).toBe(false);
    });

    test('correctly identifies values outside int16 range', () => {
      expect(isPositiveInt16(32768)).toBe(false);
      expect(isPositiveInt16(65536)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isPositiveInt16(-1)).toBe(false);
      expect(isPositiveInt16(-42)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isPositiveInt16(Number.NaN)).toBe(false);
      expect(isPositiveInt16(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isPositiveInt16(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isPositiveInt16(1.2)).toBe(false);
      expect(isPositiveInt16(-3.4)).toBe(false);
    });
  });

  describe('PositiveInt16.is', () => {
    test('same as isPositiveInt16 function', () => {
      expect(PositiveInt16.is(5)).toBe(isPositiveInt16(5));
      expect(PositiveInt16.is(0)).toBe(isPositiveInt16(0));
      expect(PositiveInt16.is(-1)).toBe(isPositiveInt16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(PositiveInt16.MIN_VALUE).toBe(1);
      expect(PositiveInt16.MAX_VALUE).toBe(32767);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveInt16(100);
    const b = asPositiveInt16(50);

    test('min and max', () => {
      expect(PositiveInt16.min(a, b)).toBe(50);
      expect(PositiveInt16.max(a, b)).toBe(100);
    });

    test('add (with clamping to positive int16 range)', () => {
      const result = PositiveInt16.add(
        asPositiveInt16(32000),
        asPositiveInt16(1000),
      );
      expect(result).toBe(32767); // clamped to max
      expect(PositiveInt16.add(a, b)).toBe(150);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveInt16.sub(a, b)).toBe(50);
      expect(PositiveInt16.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to positive int16 range)', () => {
      const result = PositiveInt16.mul(
        asPositiveInt16(1000),
        asPositiveInt16(100),
      );
      expect(result).toBe(32767); // clamped to max
      expect(PositiveInt16.mul(asPositiveInt16(10), asPositiveInt16(5))).toBe(
        50,
      );
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveInt16.div(a, asPositiveInt16(50))).toBe(2);
      expect(PositiveInt16.div(asPositiveInt16(7), asPositiveInt16(3))).toBe(2);
      expect(PositiveInt16.div(asPositiveInt16(50), asPositiveInt16(100))).toBe(
        1,
      ); // floor(50/100) = 0, clamped to 1
    });

    test('pow (with clamping to positive int16 range)', () => {
      const result = PositiveInt16.pow(
        asPositiveInt16(200),
        asPositiveInt16(3),
      );
      expect(result).toBe(32767); // clamped to max
      expect(PositiveInt16.pow(asPositiveInt16(2), asPositiveInt16(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates positive int16 values within specified range', () => {
      const min = 1;
      const max = 20;

      for (const _ of range(10)) {
        const result = PositiveInt16.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(PositiveInt16.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates values within PositiveInt16 range', () => {
      for (const _ of range(10)) {
        const result = PositiveInt16.random(1, 30);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(32767);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveInt16, number>('<=');

      expectTypeOf(asPositiveInt16(100)).toExtend<PositiveInt16>();
    });
  });
});
