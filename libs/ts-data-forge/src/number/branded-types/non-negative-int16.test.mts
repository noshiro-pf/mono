import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonNegativeInt16,
  isNonNegativeInt16,
  NonNegativeInt16,
} from './non-negative-int16.mjs';
import { asPositiveInt16 } from './positive-int16.mjs';

describe('NonNegativeInt16 test', () => {
  describe(asNonNegativeInt16, () => {
    test('accepts valid non-negative int16 values', () => {
      expect(() => asNonNegativeInt16(0)).not.toThrow();

      expect(() => asNonNegativeInt16(1)).not.toThrow();

      expect(() => asNonNegativeInt16(1000)).not.toThrow();

      expect(() => asNonNegativeInt16(32_767)).not.toThrow(); // 2^15 - 1
    });

    test('rejects negative integers', () => {
      expect(() => asNonNegativeInt16(-1)).toThrow(TypeError);

      expect(() => asNonNegativeInt16(-42)).toThrow(TypeError);

      expect(() => asNonNegativeInt16(-32_768)).toThrow(TypeError);
    });

    test('rejects values outside int16 range', () => {
      expect(() => asNonNegativeInt16(32_768)).toThrow(TypeError); // 2^15

      expect(() => asNonNegativeInt16(65_536)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonNegativeInt16(Number.NaN)).toThrow(TypeError);

      expect(() => asNonNegativeInt16(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonNegativeInt16(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonNegativeInt16(1.2)).toThrow(TypeError);

      expect(() => asNonNegativeInt16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonNegativeInt16(0)).toBe(0);

      expect(asNonNegativeInt16(5)).toBe(5);

      expect(asNonNegativeInt16(32_767)).toBe(32_767);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '-1', value: -1 },
      { name: '32768', value: 32_768 },
    ] as const)(
      `asNonNegativeInt16($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonNegativeInt16(value)).toThrow(
          new TypeError(
            `Expected a non-negative integer in [0, 2^15), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isNonNegativeInt16, () => {
    test('correctly identifies non-negative int16 values', () => {
      expect(isNonNegativeInt16(0)).toBe(true);

      expect(isNonNegativeInt16(1)).toBe(true);

      expect(isNonNegativeInt16(1000)).toBe(true);

      expect(isNonNegativeInt16(32_767)).toBe(true);
    });

    test('correctly identifies negative integers', () => {
      expect(isNonNegativeInt16(-1)).toBe(false);

      expect(isNonNegativeInt16(-42)).toBe(false);

      expect(isNonNegativeInt16(-32_768)).toBe(false);
    });

    test('correctly identifies values outside int16 range', () => {
      expect(isNonNegativeInt16(32_768)).toBe(false);

      expect(isNonNegativeInt16(65_536)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isNonNegativeInt16(Number.NaN)).toBe(false);

      expect(isNonNegativeInt16(Number.POSITIVE_INFINITY)).toBe(false);

      expect(isNonNegativeInt16(Number.NEGATIVE_INFINITY)).toBe(false);

      expect(isNonNegativeInt16(1.2)).toBe(false);

      expect(isNonNegativeInt16(-3.4)).toBe(false);
    });
  });

  describe('NonNegativeInt16.is', () => {
    test('same as isNonNegativeInt16 function', () => {
      expect(NonNegativeInt16.is(5)).toBe(isNonNegativeInt16(5));

      expect(NonNegativeInt16.is(0)).toBe(isNonNegativeInt16(0));

      expect(NonNegativeInt16.is(-1)).toBe(isNonNegativeInt16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(NonNegativeInt16.MIN_VALUE).toBe(0);

      expect(NonNegativeInt16.MAX_VALUE).toBe(32_767);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonNegativeInt16(100);

    const b = asNonNegativeInt16(50);

    const c = asNonNegativeInt16(0);

    test('min and max', () => {
      expect(NonNegativeInt16.min(a, b)).toBe(50);

      expect(NonNegativeInt16.max(a, b)).toBe(100);

      expect(NonNegativeInt16.min(a, c)).toBe(0);

      expect(NonNegativeInt16.max(a, c)).toBe(100);
    });

    test('add (with clamping to non-negative int16 range)', () => {
      const result = NonNegativeInt16.add(
        asNonNegativeInt16(32_000),
        asNonNegativeInt16(1000),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(NonNegativeInt16.add(a, b)).toBe(150);
    });

    test('sub (never goes below 0)', () => {
      expect(NonNegativeInt16.sub(a, b)).toBe(50);

      expect(NonNegativeInt16.sub(b, a)).toBe(0); // clamped to 0

      expect(NonNegativeInt16.sub(c, a)).toBe(0); // clamped to 0
    });

    test('mul (with clamping to non-negative int16 range)', () => {
      const result = NonNegativeInt16.mul(
        asNonNegativeInt16(1000),
        asNonNegativeInt16(100),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(
        NonNegativeInt16.mul(asNonNegativeInt16(10), asNonNegativeInt16(5)),
      ).toBe(50);
    });

    test('div (floor division, never goes below 0)', () => {
      expect(NonNegativeInt16.div(a, asPositiveInt16(50))).toBe(2);

      expect(
        NonNegativeInt16.div(asNonNegativeInt16(7), asPositiveInt16(3)),
      ).toBe(2);

      expect(
        NonNegativeInt16.div(asNonNegativeInt16(50), asPositiveInt16(100)),
      ).toBe(0); // floor(50/100) = 0
    });

    test('pow (with clamping to non-negative int16 range)', () => {
      const result = NonNegativeInt16.pow(
        asNonNegativeInt16(200),
        asNonNegativeInt16(3),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(
        NonNegativeInt16.pow(asNonNegativeInt16(2), asNonNegativeInt16(3)),
      ).toBe(8);
    });
  });

  describe('random', () => {
    test('generates non-negative int16 values within specified range', () => {
      const min = 0;

      const max = 20;

      for (const _ of range(10)) {
        const result = NonNegativeInt16.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        expect(NonNegativeInt16.is(result)).toBe(true);

        expect(Number.isInteger(result)).toBe(true);

        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates values within NonNegativeInt16 range', () => {
      for (const _ of range(10)) {
        const result = NonNegativeInt16.random(0, 30);

        expect(result).toBeGreaterThanOrEqual(0);

        expect(result).toBeLessThanOrEqual(32_767);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonNegativeInt16, number>('<=');

      expectTypeOf(asNonNegativeInt16(100)).toExtend<NonNegativeInt16>();
    });
  });
});
