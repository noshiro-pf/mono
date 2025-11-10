import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asInt, Int, isInt } from './int.mjs';
import { asNonZeroInt } from './non-zero-int.mjs';

describe('Int test', () => {
  describe(asInt, () => {
    test('accepts valid integers', () => {
      expect(() => asInt(0)).not.toThrow();
      expect(() => asInt(1)).not.toThrow();
      expect(() => asInt(-1)).not.toThrow();
      expect(() => asInt(42)).not.toThrow();
      expect(() => asInt(-42)).not.toThrow();
      expect(() => asInt(Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => asInt(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects non-integers', () => {
      expect(() => asInt(Number.NaN)).toThrow(TypeError);
      expect(() => asInt(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asInt(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
      expect(() => asInt(1.2)).toThrow(TypeError);
      expect(() => asInt(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asInt(5)).toBe(5);
      expect(asInt(-10)).toBe(-10);
      expect(asInt(0)).toBe(0);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
    ] as const)(`asInt($name) should throw a TypeError`, ({ value }) => {
      expect(() => asInt(value)).toThrow(
        new TypeError(`Expected an integer, got: ${value}`),
      );
    });
  });

  describe(isInt, () => {
    test('correctly identifies integers', () => {
      expect(isInt(0)).toBe(true);
      expect(isInt(1)).toBe(true);
      expect(isInt(-1)).toBe(true);
      expect(isInt(42)).toBe(true);
      expect(isInt(-42)).toBe(true);
      expect(isInt(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isInt(Number.MIN_SAFE_INTEGER)).toBe(true);
    });

    test('correctly identifies non-integers', () => {
      expect(isInt(Number.NaN)).toBe(false);
      expect(isInt(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isInt(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isInt(1.2)).toBe(false);
      expect(isInt(-3.4)).toBe(false);
    });
  });

  describe('Int.is', () => {
    test('same as isInt function', () => {
      expect(Int.is(5)).toBe(isInt(5));
      expect(Int.is(1.5)).toBe(isInt(1.5));
      expect(Int.is(-10)).toBe(isInt(-10));
    });
  });

  describe('mathematical operations', () => {
    const a = asInt(5);
    const b = asInt(2);
    const c = asInt(-3);

    test('abs', () => {
      expect(Int.abs(a)).toBe(5);
      expect(Int.abs(c)).toBe(3);
      expect(Int.abs(asInt(0))).toBe(0);
    });

    test('min and max', () => {
      expect(Int.min(a, b)).toBe(2);
      expect(Int.max(a, b)).toBe(5);
      expect(Int.min(a, c)).toBe(-3);
      expect(Int.max(a, c)).toBe(5);
    });

    test('add', () => {
      expect(Int.add(a, b)).toBe(7);
      expect(Int.add(a, c)).toBe(2);
    });

    test('sub', () => {
      expect(Int.sub(a, b)).toBe(3);
      expect(Int.sub(a, c)).toBe(8);
    });

    test('mul', () => {
      expect(Int.mul(a, b)).toBe(10);
      expect(Int.mul(a, c)).toBe(-15);
    });

    test('div (floor division)', () => {
      expect(Int.div(a, asNonZeroInt(2))).toBe(2);
      expect(Int.div(asInt(7), asNonZeroInt(3))).toBe(2);
      expect(Int.div(asInt(-7), asNonZeroInt(3))).toBe(-3);
    });

    test('pow', () => {
      expect(Int.pow(asInt(2), asInt(3))).toBe(8);
      expect(Int.pow(asInt(3), asInt(2))).toBe(9);
      expect(Int.pow(asInt(-2), asInt(3))).toBe(-8);
    });
  });

  describe('random', () => {
    test('generates integers within specified range', () => {
      const min = -5;
      const max = 10;

      for (const _ of range(10)) {
        const result = Int.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Int.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<Int, number>('<=');

      expectTypeOf(asInt(5)).toExtend<Int>();
    });
  });
});
