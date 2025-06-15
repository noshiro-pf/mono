import { expectType } from '../../expect-type.mjs';
import {
  asNonZeroFiniteNumber,
  isNonZeroFiniteNumber,
  NonZeroFiniteNumber,
} from './non-zero-finite-number.mjs';

describe('NonZeroFiniteNumber', () => {
  describe('asNonZeroFiniteNumber', () => {
    test('accepts valid non-zero finite numbers', () => {
      expect(() => asNonZeroFiniteNumber(1)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(-1)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(3.14)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(-2.5)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(0.001)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(-0.001)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(Number.MAX_VALUE)).not.toThrow();
      expect(() => asNonZeroFiniteNumber(-Number.MAX_VALUE)).not.toThrow();
    });

    test('rejects zero', () => {
      expect(() => asNonZeroFiniteNumber(0)).toThrow(TypeError);
      expect(() => asNonZeroFiniteNumber(-0)).toThrow(TypeError);
    });

    test('rejects non-finite numbers', () => {
      expect(() => asNonZeroFiniteNumber(Number.NaN)).toThrow(TypeError);
      expect(() => asNonZeroFiniteNumber(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asNonZeroFiniteNumber(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonZeroFiniteNumber(5.5)).toBe(5.5);
      expect(asNonZeroFiniteNumber(-10)).toBe(-10);
      expect(asNonZeroFiniteNumber(1)).toBe(1);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '0', value: 0 },
    ] as const)(
      `asNonZeroFiniteNumber($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonZeroFiniteNumber(value)).toThrow(
          new TypeError(`Expected a non-zero finite number, got: ${value}`),
        );
      },
    );
  });

  describe('isNonZeroFiniteNumber', () => {
    test('correctly identifies non-zero finite numbers', () => {
      expect(isNonZeroFiniteNumber(1)).toBe(true);
      expect(isNonZeroFiniteNumber(-1)).toBe(true);
      expect(isNonZeroFiniteNumber(3.14)).toBe(true);
      expect(isNonZeroFiniteNumber(-2.5)).toBe(true);
      expect(isNonZeroFiniteNumber(0.001)).toBe(true);
      expect(isNonZeroFiniteNumber(-0.001)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isNonZeroFiniteNumber(0)).toBe(false);
      expect(isNonZeroFiniteNumber(-0)).toBe(false);
    });

    test('correctly identifies non-finite numbers', () => {
      expect(isNonZeroFiniteNumber(Number.NaN)).toBe(false);
      expect(isNonZeroFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isNonZeroFiniteNumber(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });

  describe('NonZeroFiniteNumber.is', () => {
    test('same as isNonZeroFiniteNumber function', () => {
      expect(NonZeroFiniteNumber.is(5)).toBe(isNonZeroFiniteNumber(5));
      expect(NonZeroFiniteNumber.is(0)).toBe(isNonZeroFiniteNumber(0));
      expect(NonZeroFiniteNumber.is(-1)).toBe(isNonZeroFiniteNumber(-1));
    });
  });

  describe('mathematical operations', () => {
    const a = asNonZeroFiniteNumber(5.5);
    const b = asNonZeroFiniteNumber(2.5);
    const c = asNonZeroFiniteNumber(-3.5);

    test('abs', () => {
      expect(NonZeroFiniteNumber.abs(a)).toBe(5.5);
      expect(NonZeroFiniteNumber.abs(c)).toBe(3.5);
      expect(NonZeroFiniteNumber.abs(asNonZeroFiniteNumber(-1))).toBe(1);
    });

    test('min and max', () => {
      expect(NonZeroFiniteNumber.min(a, b)).toBe(2.5);
      expect(NonZeroFiniteNumber.max(a, b)).toBe(5.5);
      expect(NonZeroFiniteNumber.min(a, c)).toBe(-3.5);
      expect(NonZeroFiniteNumber.max(a, c)).toBe(5.5);
    });

    test('floor, ceil, round', () => {
      expect(NonZeroFiniteNumber.floor(a)).toBe(5);
      expect(NonZeroFiniteNumber.ceil(a)).toBe(6);
      expect(NonZeroFiniteNumber.round(a)).toBe(6);
      expect(NonZeroFiniteNumber.floor(c)).toBe(-4);
      expect(NonZeroFiniteNumber.ceil(c)).toBe(-3);
      expect(NonZeroFiniteNumber.round(c)).toBe(-3);
    });

    test('add', () => {
      expect(NonZeroFiniteNumber.add(a, b)).toBe(8);
      expect(NonZeroFiniteNumber.add(a, c)).toBe(2);
    });

    test('sub', () => {
      expect(NonZeroFiniteNumber.sub(a, b)).toBe(3);
      expect(NonZeroFiniteNumber.sub(a, c)).toBe(9);
    });

    test('mul', () => {
      expect(NonZeroFiniteNumber.mul(a, b)).toBe(13.75);
      expect(NonZeroFiniteNumber.mul(a, c)).toBe(-19.25);
    });

    test('div', () => {
      expect(NonZeroFiniteNumber.div(a, b)).toBe(2.2);
      expect(NonZeroFiniteNumber.div(a, asNonZeroFiniteNumber(2))).toBe(2.75);
    });

    test('pow', () => {
      expect(
        NonZeroFiniteNumber.pow(
          asNonZeroFiniteNumber(2),
          asNonZeroFiniteNumber(3),
        ),
      ).toBe(8);
      expect(
        NonZeroFiniteNumber.pow(
          asNonZeroFiniteNumber(3),
          asNonZeroFiniteNumber(2),
        ),
      ).toBe(9);
    });
  });

  describe('random', () => {
    test('generates non-zero numbers within specified range (positive range)', () => {
      const min = asNonZeroFiniteNumber(1.5);
      const max = asNonZeroFiniteNumber(10.3);

      for (let i = 0; i < 10; i++) {
        const result = NonZeroFiniteNumber.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(NonZeroFiniteNumber.is(result)).toBe(true);
        expect(result).not.toBe(0);
      }
    });

    test('generates non-zero numbers within specified range (negative range)', () => {
      const min = asNonZeroFiniteNumber(-10.3);
      const max = asNonZeroFiniteNumber(-1.5);

      for (let i = 0; i < 10; i++) {
        const result = NonZeroFiniteNumber.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(NonZeroFiniteNumber.is(result)).toBe(true);
        expect(result).not.toBe(0);
      }
    });

    test('generates non-zero numbers within range that spans zero', () => {
      const min = asNonZeroFiniteNumber(-5.5);
      const max = asNonZeroFiniteNumber(5.5);

      for (let i = 0; i < 10; i++) {
        const result = NonZeroFiniteNumber.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(NonZeroFiniteNumber.is(result)).toBe(true);
        expect(result).not.toBe(0);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonZeroFiniteNumber, number>('<=');

      expectTypeOf(asNonZeroFiniteNumber(5.5)).toExtend<NonZeroFiniteNumber>();
    });
  });
});
