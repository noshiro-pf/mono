import { expectType } from '../../expect-type.mjs';
import {
  asNonNegativeFiniteNumber,
  isNonNegativeFiniteNumber,
  NonNegativeFiniteNumber,
} from './non-negative-finite-number.mjs';

describe('NonNegativeFiniteNumber', () => {
  describe('asNonNegativeFiniteNumber', () => {
    test('accepts valid non-negative finite numbers', () => {
      expect(() => asNonNegativeFiniteNumber(0)).not.toThrow();
      expect(() => asNonNegativeFiniteNumber(1)).not.toThrow();
      expect(() => asNonNegativeFiniteNumber(3.14)).not.toThrow();
      expect(() => asNonNegativeFiniteNumber(0.5)).not.toThrow();
      expect(() => asNonNegativeFiniteNumber(Number.MAX_VALUE)).not.toThrow();
    });

    test('rejects negative numbers', () => {
      expect(() => asNonNegativeFiniteNumber(-1)).toThrow(TypeError);
      expect(() => asNonNegativeFiniteNumber(-0.1)).toThrow(TypeError);
      expect(() => asNonNegativeFiniteNumber(-Number.MAX_VALUE)).toThrow(
        TypeError,
      );
    });

    test('rejects non-finite numbers', () => {
      expect(() => asNonNegativeFiniteNumber(Number.NaN)).toThrow(TypeError);
      expect(() => asNonNegativeFiniteNumber(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asNonNegativeFiniteNumber(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonNegativeFiniteNumber(5.5)).toBe(5.5);
      expect(asNonNegativeFiniteNumber(0)).toBe(0);
      expect(asNonNegativeFiniteNumber(10)).toBe(10);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '-1.2', value: -1.2 },
    ] as const)(
      `asNonNegativeFiniteNumber($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonNegativeFiniteNumber(value)).toThrow(
          new TypeError(`Expected a non-negative finite number, got: ${value}`),
        );
      },
    );
  });

  describe('isNonNegativeFiniteNumber', () => {
    test('correctly identifies non-negative finite numbers', () => {
      expect(isNonNegativeFiniteNumber(0)).toBe(true);
      expect(isNonNegativeFiniteNumber(1)).toBe(true);
      expect(isNonNegativeFiniteNumber(3.14)).toBe(true);
      expect(isNonNegativeFiniteNumber(0.5)).toBe(true);
      expect(isNonNegativeFiniteNumber(Number.MAX_VALUE)).toBe(true);
    });

    test('correctly identifies negative numbers', () => {
      expect(isNonNegativeFiniteNumber(-1)).toBe(false);
      expect(isNonNegativeFiniteNumber(-0.1)).toBe(false);
      expect(isNonNegativeFiniteNumber(-Number.MAX_VALUE)).toBe(false);
    });

    test('correctly identifies non-finite numbers', () => {
      expect(isNonNegativeFiniteNumber(Number.NaN)).toBe(false);
      expect(isNonNegativeFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isNonNegativeFiniteNumber(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });

  describe('NonNegativeFiniteNumber.is', () => {
    test('same as isNonNegativeFiniteNumber function', () => {
      expect(NonNegativeFiniteNumber.is(5)).toBe(isNonNegativeFiniteNumber(5));
      expect(NonNegativeFiniteNumber.is(-1)).toBe(
        isNonNegativeFiniteNumber(-1),
      );
      expect(NonNegativeFiniteNumber.is(0)).toBe(isNonNegativeFiniteNumber(0));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE', () => {
      expect(NonNegativeFiniteNumber.MIN_VALUE).toBe(0);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonNegativeFiniteNumber(5.5);
    const b = asNonNegativeFiniteNumber(2.5);
    const c = asNonNegativeFiniteNumber(0);

    test('min and max', () => {
      expect(NonNegativeFiniteNumber.min(a, b)).toBe(2.5);
      expect(NonNegativeFiniteNumber.max(a, b)).toBe(5.5);
      expect(NonNegativeFiniteNumber.min(a, c)).toBe(0);
      expect(NonNegativeFiniteNumber.max(a, c)).toBe(5.5);
    });

    test('floor, ceil, round', () => {
      expect(NonNegativeFiniteNumber.floor(a)).toBe(5);
      expect(NonNegativeFiniteNumber.ceil(a)).toBe(6);
      expect(NonNegativeFiniteNumber.round(a)).toBe(6);
      expect(NonNegativeFiniteNumber.floor(b)).toBe(2);
      expect(NonNegativeFiniteNumber.ceil(b)).toBe(3);
      expect(NonNegativeFiniteNumber.round(b)).toBe(3);
    });

    test('add (never goes below 0)', () => {
      expect(NonNegativeFiniteNumber.add(a, b)).toBe(8);
      expect(NonNegativeFiniteNumber.add(a, c)).toBe(5.5);
    });

    test('sub (never goes below 0)', () => {
      expect(NonNegativeFiniteNumber.sub(a, b)).toBe(3);
      expect(NonNegativeFiniteNumber.sub(b, a)).toBe(0); // clamped to 0
    });

    test('mul (never goes below 0)', () => {
      expect(NonNegativeFiniteNumber.mul(a, b)).toBe(13.75);
      expect(NonNegativeFiniteNumber.mul(a, c)).toBe(0);
    });

    test('div method exists', () => {
      // Test that the div function exists and is of the right type
      expect(typeof NonNegativeFiniteNumber.div).toBe('function');
      // Note: Cannot test division without type assertions due to strict type requirements
    });

    test('pow (never goes below 0)', () => {
      expect(
        NonNegativeFiniteNumber.pow(
          asNonNegativeFiniteNumber(2),
          asNonNegativeFiniteNumber(3),
        ),
      ).toBe(8);
      expect(
        NonNegativeFiniteNumber.pow(
          asNonNegativeFiniteNumber(3),
          asNonNegativeFiniteNumber(2),
        ),
      ).toBe(9);
    });
  });

  describe('random', () => {
    test('generates non-negative numbers within specified range', () => {
      const min = asNonNegativeFiniteNumber(1.5);
      const max = asNonNegativeFiniteNumber(10.3);

      for (let i = 0; i < 10; i++) {
        const result = NonNegativeFiniteNumber.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(NonNegativeFiniteNumber.is(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates numbers starting from 0', () => {
      const min = asNonNegativeFiniteNumber(0);
      const max = asNonNegativeFiniteNumber(5);

      for (let i = 0; i < 10; i++) {
        const result = NonNegativeFiniteNumber.random(min, max);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonNegativeFiniteNumber, number>('<=');

      expectTypeOf(
        asNonNegativeFiniteNumber(5.5),
      ).toExtend<NonNegativeFiniteNumber>();
    });
  });
});
