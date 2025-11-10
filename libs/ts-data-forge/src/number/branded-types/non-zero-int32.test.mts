import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonZeroInt32,
  isNonZeroInt32,
  NonZeroInt32,
} from './non-zero-int32.mjs';

describe('NonZeroInt32 test', () => {
  describe(asNonZeroInt32, () => {
    test('accepts valid non-zero int32 values', () => {
      expect(() => asNonZeroInt32(1)).not.toThrow();
      expect(() => asNonZeroInt32(-1)).not.toThrow();
      expect(() => asNonZeroInt32(2_147_483_647)).not.toThrow(); // 2^31 - 1
      expect(() => asNonZeroInt32(-2_147_483_648)).not.toThrow(); // -2^31
    });

    test('rejects zero', () => {
      expect(() => asNonZeroInt32(0)).toThrow(TypeError);
    });

    test('rejects values outside int32 range', () => {
      expect(() => asNonZeroInt32(2_147_483_648)).toThrow(TypeError); // 2^31
      expect(() => asNonZeroInt32(-2_147_483_649)).toThrow(TypeError); // -2^31 - 1
      expect(() => asNonZeroInt32(4_294_967_296)).toThrow(TypeError);
      expect(() => asNonZeroInt32(-4_294_967_296)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonZeroInt32(Number.NaN)).toThrow(TypeError);
      expect(() => asNonZeroInt32(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asNonZeroInt32(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
      expect(() => asNonZeroInt32(1.2)).toThrow(TypeError);
      expect(() => asNonZeroInt32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonZeroInt32(5)).toBe(5);
      expect(asNonZeroInt32(-10)).toBe(-10);
      expect(asNonZeroInt32(2_147_483_647)).toBe(2_147_483_647);
      expect(asNonZeroInt32(-2_147_483_648)).toBe(-2_147_483_648);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '2147483648', value: 2_147_483_648 },
      { name: '-2147483649', value: -2_147_483_649 },
    ] as const)(
      `asNonZeroInt32($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonZeroInt32(value)).toThrow(
          new TypeError(
            `Expected a non-zero integer in [-2^31, 2^31), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isNonZeroInt32, () => {
    test('correctly identifies non-zero int32 values', () => {
      expect(isNonZeroInt32(1)).toBe(true);
      expect(isNonZeroInt32(-1)).toBe(true);
      expect(isNonZeroInt32(2_147_483_647)).toBe(true);
      expect(isNonZeroInt32(-2_147_483_648)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isNonZeroInt32(0)).toBe(false);
    });

    test('correctly identifies values outside int32 range', () => {
      expect(isNonZeroInt32(2_147_483_648)).toBe(false);
      expect(isNonZeroInt32(-2_147_483_649)).toBe(false);
      expect(isNonZeroInt32(4_294_967_296)).toBe(false);
      expect(isNonZeroInt32(-4_294_967_296)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isNonZeroInt32(Number.NaN)).toBe(false);
      expect(isNonZeroInt32(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isNonZeroInt32(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isNonZeroInt32(1.2)).toBe(false);
      expect(isNonZeroInt32(-3.4)).toBe(false);
    });
  });

  describe('NonZeroInt32.is', () => {
    test('same as isNonZeroInt32 function', () => {
      expect(NonZeroInt32.is(5)).toBe(isNonZeroInt32(5));
      expect(NonZeroInt32.is(0)).toBe(isNonZeroInt32(0));
      expect(NonZeroInt32.is(-1)).toBe(isNonZeroInt32(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(NonZeroInt32.MIN_VALUE).toBe(-2_147_483_648);
      expect(NonZeroInt32.MAX_VALUE).toBe(2_147_483_647);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonZeroInt32(1_000_000);
    const b = asNonZeroInt32(500_000);
    const c = asNonZeroInt32(-300_000);

    test('abs', () => {
      expect(NonZeroInt32.abs(a)).toBe(1_000_000);
      expect(NonZeroInt32.abs(c)).toBe(300_000);
    });

    test('min and max', () => {
      expect(NonZeroInt32.min(a, b)).toBe(500_000);
      expect(NonZeroInt32.max(a, b)).toBe(1_000_000);
      expect(NonZeroInt32.min(a, c)).toBe(-300_000);
      expect(NonZeroInt32.max(a, c)).toBe(1_000_000);
    });

    test('add (with clamping)', () => {
      const result = NonZeroInt32.add(
        asNonZeroInt32(2_147_483_000),
        asNonZeroInt32(1000),
      );

      expect(result).toBe(2_147_483_647); // clamped to max
      expect(NonZeroInt32.add(a, b)).toBe(1_500_000);
    });

    test('sub (with clamping)', () => {
      const result = NonZeroInt32.sub(
        asNonZeroInt32(-2_147_483_000),
        asNonZeroInt32(1000),
      );

      expect(result).toBe(-2_147_483_648); // clamped to min
      expect(NonZeroInt32.sub(a, b)).toBe(500_000);
    });

    test('mul (with clamping)', () => {
      const result = NonZeroInt32.mul(
        asNonZeroInt32(100_000),
        asNonZeroInt32(100_000),
      );

      expect(result).toBe(2_147_483_647); // clamped to max
      expect(NonZeroInt32.mul(asNonZeroInt32(1000), asNonZeroInt32(5))).toBe(
        5000,
      );
    });

    test('div (floor division with clamping)', () => {
      expect(NonZeroInt32.div(a, asNonZeroInt32(500_000))).toBe(2);
      expect(NonZeroInt32.div(asNonZeroInt32(7), asNonZeroInt32(3))).toBe(2);
      expect(NonZeroInt32.div(asNonZeroInt32(-7), asNonZeroInt32(3))).toBe(-3);
    });

    test('pow (with clamping)', () => {
      const result = NonZeroInt32.pow(
        asNonZeroInt32(10_000),
        asNonZeroInt32(3),
      );

      expect(result).toBe(2_147_483_647); // clamped to max
      expect(NonZeroInt32.pow(asNonZeroInt32(2), asNonZeroInt32(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates non-zero int32 values within specified range', () => {
      const min = -10;
      const max = 10;

      for (const _ of range(10)) {
        const result = NonZeroInt32.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(NonZeroInt32.is(result)).toBe(true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).not.toBe(0);
      }
    });

    test('generates values within NonZeroInt32 range', () => {
      for (const _ of range(10)) {
        const result = NonZeroInt32.random(-20, 20);

        expect(result).toBeGreaterThanOrEqual(-2_147_483_648);
        expect(result).toBeLessThanOrEqual(2_147_483_647);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonZeroInt32, number>('<=');

      expectTypeOf(asNonZeroInt32(1_000_000)).toExtend<NonZeroInt32>();
    });
  });
});
