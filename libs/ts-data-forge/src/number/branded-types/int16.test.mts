import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asInt16, Int16, isInt16 } from './int16.mjs';
import { asNonZeroInt16 } from './non-zero-int16.mjs';

describe('Int16 test', () => {
  describe(asInt16, () => {
    test('accepts valid int16 values', () => {
      expect(() => asInt16(0)).not.toThrow();
      expect(() => asInt16(1)).not.toThrow();
      expect(() => asInt16(-1)).not.toThrow();
      expect(() => asInt16(32_767)).not.toThrow(); // 2^15 - 1
      expect(() => asInt16(-32_768)).not.toThrow(); // -2^15
    });

    test('rejects values outside int16 range', () => {
      expect(() => asInt16(32_768)).toThrow(TypeError); // 2^15
      expect(() => asInt16(-32_769)).toThrow(TypeError); // -2^15 - 1
      expect(() => asInt16(65_536)).toThrow(TypeError);
      expect(() => asInt16(-65_536)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asInt16(Number.NaN)).toThrow(TypeError);
      expect(() => asInt16(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asInt16(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
      expect(() => asInt16(1.2)).toThrow(TypeError);
      expect(() => asInt16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asInt16(5)).toBe(5);
      expect(asInt16(-10)).toBe(-10);
      expect(asInt16(0)).toBe(0);
      expect(asInt16(32_767)).toBe(32_767);
      expect(asInt16(-32_768)).toBe(-32_768);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
    ] as const)(`asInt16($name) should throw a TypeError`, ({ value }) => {
      expect(() => asInt16(value)).toThrow(
        new TypeError(`Expected an integer in [-2^15, 2^15), got: ${value}`),
      );
    });
  });

  describe(isInt16, () => {
    test('correctly identifies int16 values', () => {
      expect(isInt16(0)).toBe(true);
      expect(isInt16(1)).toBe(true);
      expect(isInt16(-1)).toBe(true);
      expect(isInt16(32_767)).toBe(true);
      expect(isInt16(-32_768)).toBe(true);
    });

    test('correctly identifies values outside int16 range', () => {
      expect(isInt16(32_768)).toBe(false);
      expect(isInt16(-32_769)).toBe(false);
      expect(isInt16(65_536)).toBe(false);
      expect(isInt16(-65_536)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isInt16(Number.NaN)).toBe(false);
      expect(isInt16(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isInt16(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isInt16(1.2)).toBe(false);
      expect(isInt16(-3.4)).toBe(false);
    });
  });

  describe('Int16.is', () => {
    test('same as isInt16 function', () => {
      expect(Int16.is(5)).toBe(isInt16(5));
      expect(Int16.is(32_768)).toBe(isInt16(32_768));
      expect(Int16.is(-32_769)).toBe(isInt16(-32_769));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(Int16.MIN_VALUE).toBe(-32_768);
      expect(Int16.MAX_VALUE).toBe(32_767);
    });
  });

  describe('mathematical operations', () => {
    const a = asInt16(100);
    const b = asInt16(50);
    const c = asInt16(-30);

    test('abs', () => {
      expect(Int16.abs(a)).toBe(100);
      expect(Int16.abs(c)).toBe(30);
      expect(Int16.abs(asInt16(0))).toBe(0);
    });

    test('min and max', () => {
      expect(Int16.min(a, b)).toBe(50);
      expect(Int16.max(a, b)).toBe(100);
      expect(Int16.min(a, c)).toBe(-30);
      expect(Int16.max(a, c)).toBe(100);
    });

    test('add (with clamping)', () => {
      const result = Int16.add(asInt16(32_000), asInt16(1000));

      expect(result).toBe(32_767); // clamped to max
      expect(Int16.add(a, b)).toBe(150);
    });

    test('sub (with clamping)', () => {
      const result = Int16.sub(asInt16(-32_000), asInt16(1000));

      expect(result).toBe(-32_768); // clamped to min
      expect(Int16.sub(a, b)).toBe(50);
    });

    test('mul (with clamping)', () => {
      const result = Int16.mul(asInt16(1000), asInt16(100));

      expect(result).toBe(32_767); // clamped to max
      expect(Int16.mul(asInt16(10), asInt16(5))).toBe(50);
    });

    test('div (floor division with clamping)', () => {
      expect(Int16.div(a, asNonZeroInt16(50))).toBe(2);
      expect(Int16.div(asInt16(7), asNonZeroInt16(3))).toBe(2);
      expect(Int16.div(asInt16(-7), asNonZeroInt16(3))).toBe(-3);
    });

    test('pow (with clamping)', () => {
      const result = Int16.pow(asInt16(200), asInt16(3));

      expect(result).toBe(32_767); // clamped to max
      expect(Int16.pow(asInt16(2), asInt16(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates int16 values within specified range', () => {
      const min = -10;
      const max = 10;

      for (const _ of range(10)) {
        const result = Int16.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Int16.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('generates values within Int16 range', () => {
      for (const _ of range(10)) {
        const result = Int16.random(-20, 20);

        expect(result).toBeGreaterThanOrEqual(Int16.MIN_VALUE);
        expect(result).toBeLessThanOrEqual(Int16.MAX_VALUE);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<Int16, number>('<=');

      expectTypeOf(asInt16(100)).toExtend<Int16>();
    });
  });
});
