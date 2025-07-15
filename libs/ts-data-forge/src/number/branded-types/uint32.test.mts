import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asNonZeroUint32 } from './non-zero-uint32.mjs';
import { asUint32, isUint32, Uint32 } from './uint32.mjs';

describe('Uint32', () => {
  describe('asUint32', () => {
    test('accepts valid uint32 values', () => {
      expect(() => asUint32(0)).not.toThrow();
      expect(() => asUint32(1)).not.toThrow();
      expect(() => asUint32(4294967295)).not.toThrow(); // 2^32 - 1
      expect(() => asUint32(2147483648)).not.toThrow(); // 2^31
    });

    test('rejects values outside uint32 range', () => {
      expect(() => asUint32(4294967296)).toThrow(TypeError); // 2^32
      expect(() => asUint32(10000000000)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asUint32(-1)).toThrow(TypeError);
      expect(() => asUint32(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asUint32(Number.NaN)).toThrow(TypeError);
      expect(() => asUint32(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asUint32(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
      expect(() => asUint32(1.2)).toThrow(TypeError);
      expect(() => asUint32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asUint32(5)).toBe(5);
      expect(asUint32(0)).toBe(0);
      expect(asUint32(4294967295)).toBe(4294967295);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '-1', value: -1 },
    ] as const)(`asUint32($name) should throw a TypeError`, ({ value }) => {
      expect(() => asUint32(value)).toThrow(
        new TypeError(
          `Expected a non-negative integer less than 2^32, got: ${value}`,
        ),
      );
    });
  });

  describe('isUint32', () => {
    test('correctly identifies uint32 values', () => {
      expect(isUint32(0)).toBe(true);
      expect(isUint32(1)).toBe(true);
      expect(isUint32(4294967295)).toBe(true);
      expect(isUint32(2147483648)).toBe(true);
    });

    test('correctly identifies values outside uint32 range', () => {
      expect(isUint32(4294967296)).toBe(false);
      expect(isUint32(10000000000)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isUint32(-1)).toBe(false);
      expect(isUint32(-42)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isUint32(Number.NaN)).toBe(false);
      expect(isUint32(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isUint32(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isUint32(1.2)).toBe(false);
      expect(isUint32(-3.4)).toBe(false);
    });
  });

  describe('Uint32.is', () => {
    test('same as isUint32 function', () => {
      expect(Uint32.is(5)).toBe(isUint32(5));
      expect(Uint32.is(4294967296)).toBe(isUint32(4294967296));
      expect(Uint32.is(-1)).toBe(isUint32(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(Uint32.MIN_VALUE).toBe(0);
      expect(Uint32.MAX_VALUE).toBe(4294967295);
    });
  });

  describe('mathematical operations', () => {
    const a = asUint32(1000000);
    const b = asUint32(500000);
    const c = asUint32(0);

    test('min and max', () => {
      expect(Uint32.min(a, b)).toBe(500000);
      expect(Uint32.max(a, b)).toBe(1000000);
      expect(Uint32.min(a, c)).toBe(0);
      expect(Uint32.max(a, c)).toBe(1000000);
    });

    test('add (with clamping to uint32 range)', () => {
      const result = Uint32.add(asUint32(4294967000), asUint32(1000));
      expect(result).toBe(4294967295); // clamped to max
      expect(Uint32.add(a, b)).toBe(1500000);
    });

    test('sub (never goes below 0)', () => {
      expect(Uint32.sub(a, b)).toBe(500000);
      expect(Uint32.sub(b, a)).toBe(0); // clamped to 0
      expect(Uint32.sub(c, a)).toBe(0); // clamped to 0
    });

    test('mul (with clamping to uint32 range)', () => {
      const result = Uint32.mul(asUint32(100000), asUint32(100000));
      expect(result).toBe(4294967295); // clamped to max
      expect(Uint32.mul(asUint32(1000), asUint32(5))).toBe(5000);
    });

    test('div (floor division, never goes below 0)', () => {
      expect(Uint32.div(a, asNonZeroUint32(500000))).toBe(2);
      expect(Uint32.div(asUint32(7), asNonZeroUint32(3))).toBe(2);
      expect(Uint32.div(asUint32(500000), asNonZeroUint32(1000000))).toBe(0); // floor(500000/1000000) = 0
    });

    test('pow (with clamping to uint32 range)', () => {
      const result = Uint32.pow(asUint32(10000), asUint32(3));
      expect(result).toBe(4294967295); // clamped to max
      expect(Uint32.pow(asUint32(2), asUint32(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates uint32 values within specified range', () => {
      const min = 0;
      const max = 20;

      for (const _ of range(10)) {
        const result = Uint32.random(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Uint32.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates values within Uint32 range', () => {
      for (const _ of range(10)) {
        const result = Uint32.random(0, 30);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(4294967295);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<Uint32, number>('<=');

      expectTypeOf(asUint32(1000000)).toExtend<Uint32>();
    });
  });
});
