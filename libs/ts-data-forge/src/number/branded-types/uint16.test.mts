import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asNonZeroUint16 } from './non-zero-uint16.mjs';
import { asUint16, isUint16, Uint16 } from './uint16.mjs';

describe('Uint16', () => {
  describe('asUint16', () => {
    test('accepts valid uint16 values', () => {
      expect(() => asUint16(0)).not.toThrow();
      expect(() => asUint16(1)).not.toThrow();
      expect(() => asUint16(65535)).not.toThrow(); // 2^16 - 1
      expect(() => asUint16(32768)).not.toThrow(); // 2^15
    });

    test('rejects values outside uint16 range', () => {
      expect(() => asUint16(65536)).toThrow(TypeError); // 2^16
      expect(() => asUint16(100000)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asUint16(-1)).toThrow(TypeError);
      expect(() => asUint16(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asUint16(Number.NaN)).toThrow(TypeError);
      expect(() => asUint16(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asUint16(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
      expect(() => asUint16(1.2)).toThrow(TypeError);
      expect(() => asUint16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asUint16(5)).toBe(5);
      expect(asUint16(0)).toBe(0);
      expect(asUint16(65535)).toBe(65535);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '-1', value: -1 },
    ] as const)(`asUint16($name) should throw a TypeError`, ({ value }) => {
      expect(() => asUint16(value)).toThrow(
        new TypeError(
          `Expected a non-negative integer less than 2^16, got: ${value}`,
        ),
      );
    });
  });

  describe('isUint16', () => {
    test('correctly identifies uint16 values', () => {
      expect(isUint16(0)).toBe(true);
      expect(isUint16(1)).toBe(true);
      expect(isUint16(65535)).toBe(true);
      expect(isUint16(32768)).toBe(true);
    });

    test('correctly identifies values outside uint16 range', () => {
      expect(isUint16(65536)).toBe(false);
      expect(isUint16(100000)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isUint16(-1)).toBe(false);
      expect(isUint16(-42)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isUint16(Number.NaN)).toBe(false);
      expect(isUint16(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isUint16(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isUint16(1.2)).toBe(false);
      expect(isUint16(-3.4)).toBe(false);
    });
  });

  describe('Uint16.is', () => {
    test('same as isUint16 function', () => {
      expect(Uint16.is(5)).toBe(isUint16(5));
      expect(Uint16.is(65536)).toBe(isUint16(65536));
      expect(Uint16.is(-1)).toBe(isUint16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(Uint16.MIN_VALUE).toBe(0);
      expect(Uint16.MAX_VALUE).toBe(65535);
    });
  });

  describe('mathematical operations', () => {
    const a = asUint16(100);
    const b = asUint16(50);
    const c = asUint16(0);

    test('min and max', () => {
      expect(Uint16.min(a, b)).toBe(50);
      expect(Uint16.max(a, b)).toBe(100);
      expect(Uint16.min(a, c)).toBe(0);
      expect(Uint16.max(a, c)).toBe(100);
    });

    test('add (with clamping to uint16 range)', () => {
      const result = Uint16.add(asUint16(65000), asUint16(1000));
      expect(result).toBe(65535); // clamped to max
      expect(Uint16.add(a, b)).toBe(150);
    });

    test('sub (never goes below 0)', () => {
      expect(Uint16.sub(a, b)).toBe(50);
      expect(Uint16.sub(b, a)).toBe(0); // clamped to 0
      expect(Uint16.sub(c, a)).toBe(0); // clamped to 0
    });

    test('mul (with clamping to uint16 range)', () => {
      const result = Uint16.mul(asUint16(1000), asUint16(100));
      expect(result).toBe(65535); // clamped to max
      expect(Uint16.mul(asUint16(10), asUint16(5))).toBe(50);
    });

    test('div (floor division, never goes below 0)', () => {
      expect(Uint16.div(a, asNonZeroUint16(50))).toBe(2);
      expect(Uint16.div(asUint16(7), asNonZeroUint16(3))).toBe(2);
      expect(Uint16.div(asUint16(50), asNonZeroUint16(100))).toBe(0); // floor(50/100) = 0
    });

    test('pow (with clamping to uint16 range)', () => {
      const result = Uint16.pow(asUint16(256), asUint16(3));
      expect(result).toBe(65535); // clamped to max
      expect(Uint16.pow(asUint16(2), asUint16(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates uint16 values within specified range', () => {
      const min = 0;
      const max = 20;

      for (const _ of range(10)) {
        const result = Uint16.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Uint16.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates values within Uint16 range', () => {
      for (const _ of range(10)) {
        const result = Uint16.random(0, 30);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(65535);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<Uint16, number>('<=');

      expectTypeOf(asUint16(100)).toExtend<Uint16>();
    });
  });
});
