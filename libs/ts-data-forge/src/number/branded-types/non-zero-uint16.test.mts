import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonZeroUint16,
  isNonZeroUint16,
  NonZeroUint16,
} from './non-zero-uint16.mjs';

describe('NonZeroUint16', () => {
  describe('asNonZeroUint16', () => {
    test('accepts valid non-zero uint16 values', () => {
      expect(() => asNonZeroUint16(1)).not.toThrow();
      expect(() => asNonZeroUint16(1000)).not.toThrow();
      expect(() => asNonZeroUint16(65_535)).not.toThrow(); // 2^16 - 1
      expect(() => asNonZeroUint16(32_768)).not.toThrow(); // 2^15
    });

    test('rejects zero', () => {
      expect(() => asNonZeroUint16(0)).toThrow(TypeError);
    });

    test('rejects values outside uint16 range', () => {
      expect(() => asNonZeroUint16(65_536)).toThrow(TypeError); // 2^16
      expect(() => asNonZeroUint16(100_000)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asNonZeroUint16(-1)).toThrow(TypeError);
      expect(() => asNonZeroUint16(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonZeroUint16(Number.NaN)).toThrow(TypeError);
      expect(() => asNonZeroUint16(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asNonZeroUint16(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asNonZeroUint16(1.2)).toThrow(TypeError);
      expect(() => asNonZeroUint16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonZeroUint16(5)).toBe(5);
      expect(asNonZeroUint16(1)).toBe(1);
      expect(asNonZeroUint16(65_535)).toBe(65_535);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '65536', value: 65_536 },
    ] as const)(
      `asNonZeroUint16($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonZeroUint16(value)).toThrow(
          new TypeError(
            `Expected a non-zero integer in [1, 2^16), got: ${value}`,
          ),
        );
      },
    );
  });

  describe('isNonZeroUint16', () => {
    test('correctly identifies non-zero uint16 values', () => {
      expect(isNonZeroUint16(1)).toBe(true);
      expect(isNonZeroUint16(1000)).toBe(true);
      expect(isNonZeroUint16(65_535)).toBe(true);
      expect(isNonZeroUint16(32_768)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isNonZeroUint16(0)).toBe(false);
    });

    test('correctly identifies values outside uint16 range', () => {
      expect(isNonZeroUint16(65_536)).toBe(false);
      expect(isNonZeroUint16(100_000)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isNonZeroUint16(-1)).toBe(false);
      expect(isNonZeroUint16(-42)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isNonZeroUint16(Number.NaN)).toBe(false);
      expect(isNonZeroUint16(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isNonZeroUint16(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isNonZeroUint16(1.2)).toBe(false);
      expect(isNonZeroUint16(-3.4)).toBe(false);
    });
  });

  describe('NonZeroUint16.is', () => {
    test('same as isNonZeroUint16 function', () => {
      expect(NonZeroUint16.is(5)).toBe(isNonZeroUint16(5));
      expect(NonZeroUint16.is(0)).toBe(isNonZeroUint16(0));
      expect(NonZeroUint16.is(-1)).toBe(isNonZeroUint16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(NonZeroUint16.MIN_VALUE).toBe(1);
      expect(NonZeroUint16.MAX_VALUE).toBe(65_535);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonZeroUint16(100);
    const b = asNonZeroUint16(50);

    test('min and max', () => {
      expect(NonZeroUint16.min(a, b)).toBe(50);
      expect(NonZeroUint16.max(a, b)).toBe(100);
    });

    test('add (with clamping to non-zero uint16 range)', () => {
      const result = NonZeroUint16.add(
        asNonZeroUint16(65_000),
        asNonZeroUint16(1000),
      );
      expect(result).toBe(65_535); // clamped to max
      expect(NonZeroUint16.add(a, b)).toBe(150);
    });

    test('sub (never goes below 1)', () => {
      expect(NonZeroUint16.sub(a, b)).toBe(50);
      expect(NonZeroUint16.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to non-zero uint16 range)', () => {
      const result = NonZeroUint16.mul(
        asNonZeroUint16(1000),
        asNonZeroUint16(100),
      );
      expect(result).toBe(65_535); // clamped to max
      expect(NonZeroUint16.mul(asNonZeroUint16(10), asNonZeroUint16(5))).toBe(
        50,
      );
    });

    test('div (floor division, never goes below 1)', () => {
      expect(NonZeroUint16.div(a, asNonZeroUint16(50))).toBe(2);
      expect(NonZeroUint16.div(asNonZeroUint16(7), asNonZeroUint16(3))).toBe(2);
      expect(NonZeroUint16.div(asNonZeroUint16(50), asNonZeroUint16(100))).toBe(
        1,
      ); // floor(50/100) = 0, clamped to 1
    });

    test('pow (with clamping to non-zero uint16 range)', () => {
      const result = NonZeroUint16.pow(
        asNonZeroUint16(256),
        asNonZeroUint16(3),
      );
      expect(result).toBe(65_535); // clamped to max
      expect(NonZeroUint16.pow(asNonZeroUint16(2), asNonZeroUint16(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates non-zero uint16 values within specified range', () => {
      const min = 1;
      const max = 20;

      for (const _ of range(10)) {
        const result = NonZeroUint16.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(NonZeroUint16.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).not.toBe(0);
      }
    });

    test('generates values within NonZeroUint16 range', () => {
      for (const _ of range(10)) {
        const result = NonZeroUint16.random(1, 30);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(65_535);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonZeroUint16, number>('<=');

      expectTypeOf(asNonZeroUint16(100)).toExtend<NonZeroUint16>();
    });
  });
});
