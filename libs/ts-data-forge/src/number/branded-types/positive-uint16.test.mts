import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveUint16,
  isPositiveUint16,
  PositiveUint16,
} from './positive-uint16.mjs';

describe('PositiveUint16', () => {
  describe('asPositiveUint16', () => {
    test('accepts valid positive uint16 values', () => {
      expect(() => asPositiveUint16(1)).not.toThrow();
      expect(() => asPositiveUint16(1000)).not.toThrow();
      expect(() => asPositiveUint16(65535)).not.toThrow(); // 2^16 - 1
      expect(() => asPositiveUint16(32768)).not.toThrow(); // 2^15
    });

    test('rejects zero', () => {
      expect(() => asPositiveUint16(0)).toThrow(TypeError);
    });

    test('rejects values outside uint16 range', () => {
      expect(() => asPositiveUint16(65536)).toThrow(TypeError); // 2^16
      expect(() => asPositiveUint16(100000)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveUint16(-1)).toThrow(TypeError);
      expect(() => asPositiveUint16(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveUint16(Number.NaN)).toThrow(TypeError);
      expect(() => asPositiveUint16(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asPositiveUint16(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
      expect(() => asPositiveUint16(1.2)).toThrow(TypeError);
      expect(() => asPositiveUint16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveUint16(5)).toBe(5);
      expect(asPositiveUint16(1)).toBe(1);
      expect(asPositiveUint16(65535)).toBe(65535);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '65536', value: 65536 },
    ] as const)(
      `asPositiveUint16($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveUint16(value)).toThrow(
          new TypeError(
            `Expected a positive integer in [1, 2^16), got: ${value}`,
          ),
        );
      },
    );
  });

  describe('isPositiveUint16', () => {
    test('correctly identifies positive uint16 values', () => {
      expect(isPositiveUint16(1)).toBe(true);
      expect(isPositiveUint16(1000)).toBe(true);
      expect(isPositiveUint16(65535)).toBe(true);
      expect(isPositiveUint16(32768)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isPositiveUint16(0)).toBe(false);
    });

    test('correctly identifies values outside uint16 range', () => {
      expect(isPositiveUint16(65536)).toBe(false);
      expect(isPositiveUint16(100000)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isPositiveUint16(-1)).toBe(false);
      expect(isPositiveUint16(-42)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isPositiveUint16(Number.NaN)).toBe(false);
      expect(isPositiveUint16(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isPositiveUint16(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isPositiveUint16(1.2)).toBe(false);
      expect(isPositiveUint16(-3.4)).toBe(false);
    });
  });

  describe('PositiveUint16.is', () => {
    test('same as isPositiveUint16 function', () => {
      expect(PositiveUint16.is(5)).toBe(isPositiveUint16(5));
      expect(PositiveUint16.is(0)).toBe(isPositiveUint16(0));
      expect(PositiveUint16.is(-1)).toBe(isPositiveUint16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(PositiveUint16.MIN_VALUE).toBe(1);
      expect(PositiveUint16.MAX_VALUE).toBe(65535);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveUint16(100);
    const b = asPositiveUint16(50);

    test('min and max', () => {
      expect(PositiveUint16.min(a, b)).toBe(50);
      expect(PositiveUint16.max(a, b)).toBe(100);
    });

    test('add (with clamping to positive uint16 range)', () => {
      const result = PositiveUint16.add(
        asPositiveUint16(65000),
        asPositiveUint16(1000),
      );
      expect(result).toBe(65535); // clamped to max
      expect(PositiveUint16.add(a, b)).toBe(150);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveUint16.sub(a, b)).toBe(50);
      expect(PositiveUint16.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to positive uint16 range)', () => {
      const result = PositiveUint16.mul(
        asPositiveUint16(1000),
        asPositiveUint16(100),
      );
      expect(result).toBe(65535); // clamped to max
      expect(
        PositiveUint16.mul(asPositiveUint16(10), asPositiveUint16(5)),
      ).toBe(50);
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveUint16.div(a, asPositiveUint16(50))).toBe(2);
      expect(PositiveUint16.div(asPositiveUint16(7), asPositiveUint16(3))).toBe(
        2,
      );
      expect(
        PositiveUint16.div(asPositiveUint16(50), asPositiveUint16(100)),
      ).toBe(1); // floor(50/100) = 0, clamped to 1
    });

    test('pow (with clamping to positive uint16 range)', () => {
      const result = PositiveUint16.pow(
        asPositiveUint16(256),
        asPositiveUint16(3),
      );
      expect(result).toBe(65535); // clamped to max
      expect(PositiveUint16.pow(asPositiveUint16(2), asPositiveUint16(3))).toBe(
        8,
      );
    });
  });

  describe('random', () => {
    test('generates positive uint16 values within specified range', () => {
      const min = 1;
      const max = 20;

      for (const _ of range(10)) {
        const result = PositiveUint16.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(PositiveUint16.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates values within PositiveUint16 range', () => {
      for (const _ of range(10)) {
        const result = PositiveUint16.random(1, 30);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(65535);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveUint16, number>('<=');

      expectTypeOf(asPositiveUint16(100)).toExtend<PositiveUint16>();
    });
  });
});
