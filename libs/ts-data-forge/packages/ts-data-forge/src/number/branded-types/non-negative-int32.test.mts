import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonNegativeInt32,
  isNonNegativeInt32,
  NonNegativeInt32,
} from './non-negative-int32.mjs';
import { asPositiveInt32 } from './positive-int32.mjs';

describe('NonNegativeInt32 test', () => {
  describe(asNonNegativeInt32, () => {
    test('accepts valid non-negative int32 values', () => {
      expect(() => asNonNegativeInt32(0)).not.toThrow();

      expect(() => asNonNegativeInt32(1)).not.toThrow();

      expect(() => asNonNegativeInt32(1000)).not.toThrow();

      expect(() => asNonNegativeInt32(2_147_483_647)).not.toThrow(); // 2^31 - 1
    });

    test('rejects negative integers', () => {
      expect(() => asNonNegativeInt32(-1)).toThrow(TypeError);

      expect(() => asNonNegativeInt32(-42)).toThrow(TypeError);

      expect(() => asNonNegativeInt32(-2_147_483_648)).toThrow(TypeError);
    });

    test('rejects values outside int32 range', () => {
      expect(() => asNonNegativeInt32(2_147_483_648)).toThrow(TypeError); // 2^31

      expect(() => asNonNegativeInt32(4_294_967_296)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonNegativeInt32(Number.NaN)).toThrow(TypeError);

      expect(() => asNonNegativeInt32(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonNegativeInt32(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonNegativeInt32(1.2)).toThrow(TypeError);

      expect(() => asNonNegativeInt32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonNegativeInt32(0)).toBe(0);

      expect(asNonNegativeInt32(5)).toBe(5);

      expect(asNonNegativeInt32(2_147_483_647)).toBe(2_147_483_647);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '-1', value: -1 },
      { name: '2147483648', value: 2_147_483_648 },
    ] as const)(
      `asNonNegativeInt32($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonNegativeInt32(value)).toThrow(
          new TypeError(
            `Expected a non-negative integer in [0, 2^31), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isNonNegativeInt32, () => {
    test('correctly identifies non-negative int32 values', () => {
      assert.isTrue(isNonNegativeInt32(0));

      assert.isTrue(isNonNegativeInt32(1));

      assert.isTrue(isNonNegativeInt32(1000));

      assert.isTrue(isNonNegativeInt32(2_147_483_647));
    });

    test('correctly identifies negative integers', () => {
      assert.isFalse(isNonNegativeInt32(-1));

      assert.isFalse(isNonNegativeInt32(-42));

      assert.isFalse(isNonNegativeInt32(-2_147_483_648));
    });

    test('correctly identifies values outside int32 range', () => {
      assert.isFalse(isNonNegativeInt32(2_147_483_648));

      assert.isFalse(isNonNegativeInt32(4_294_967_296));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isNonNegativeInt32(Number.NaN));

      assert.isFalse(isNonNegativeInt32(Number.POSITIVE_INFINITY));

      assert.isFalse(isNonNegativeInt32(Number.NEGATIVE_INFINITY));

      assert.isFalse(isNonNegativeInt32(1.2));

      assert.isFalse(isNonNegativeInt32(-3.4));
    });
  });

  describe('NonNegativeInt32.is', () => {
    test('same as isNonNegativeInt32 function', () => {
      expect(NonNegativeInt32.is(5)).toBe(isNonNegativeInt32(5));

      expect(NonNegativeInt32.is(0)).toBe(isNonNegativeInt32(0));

      expect(NonNegativeInt32.is(-1)).toBe(isNonNegativeInt32(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(NonNegativeInt32.MIN_VALUE).toBe(0);

      expect(NonNegativeInt32.MAX_VALUE).toBe(2_147_483_647);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonNegativeInt32(1_000_000);

    const b = asNonNegativeInt32(500_000);

    const c = asNonNegativeInt32(0);

    test('min and max', () => {
      expect(NonNegativeInt32.min(a, b)).toBe(500_000);

      expect(NonNegativeInt32.max(a, b)).toBe(1_000_000);

      expect(NonNegativeInt32.min(a, c)).toBe(0);

      expect(NonNegativeInt32.max(a, c)).toBe(1_000_000);
    });

    test('add (with clamping to non-negative int32 range)', () => {
      const result = NonNegativeInt32.add(
        asNonNegativeInt32(2_147_483_000),
        asNonNegativeInt32(1000),
      );

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(NonNegativeInt32.add(a, b)).toBe(1_500_000);
    });

    test('sub (never goes below 0)', () => {
      expect(NonNegativeInt32.sub(a, b)).toBe(500_000);

      expect(NonNegativeInt32.sub(b, a)).toBe(0); // clamped to 0

      expect(NonNegativeInt32.sub(c, a)).toBe(0); // clamped to 0
    });

    test('mul (with clamping to non-negative int32 range)', () => {
      const result = NonNegativeInt32.mul(
        asNonNegativeInt32(100_000),
        asNonNegativeInt32(100_000),
      );

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(
        NonNegativeInt32.mul(asNonNegativeInt32(1000), asNonNegativeInt32(5)),
      ).toBe(5000);
    });

    test('div (floor division, never goes below 0)', () => {
      expect(NonNegativeInt32.div(a, asPositiveInt32(500_000))).toBe(2);

      expect(
        NonNegativeInt32.div(asNonNegativeInt32(7), asPositiveInt32(3)),
      ).toBe(2);

      expect(
        NonNegativeInt32.div(
          asNonNegativeInt32(500_000),
          asPositiveInt32(1_000_000),
        ),
      ).toBe(0); // floor(500000/1000000) = 0
    });

    test('pow (with clamping to non-negative int32 range)', () => {
      const result = NonNegativeInt32.pow(
        asNonNegativeInt32(10_000),
        asNonNegativeInt32(3),
      );

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(
        NonNegativeInt32.pow(asNonNegativeInt32(2), asNonNegativeInt32(3)),
      ).toBe(8);
    });
  });

  describe('random', () => {
    test('generates non-negative int32 values within specified range', () => {
      const min = 0;

      const max = 20;

      for (const _ of range(10)) {
        const result = NonNegativeInt32.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(NonNegativeInt32.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates values within NonNegativeInt32 range', () => {
      for (const _ of range(10)) {
        const result = NonNegativeInt32.random(0, 30);

        expect(result).toBeGreaterThanOrEqual(0);

        expect(result).toBeLessThanOrEqual(2_147_483_647);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonNegativeInt32, number>('<=');

      expectTypeOf(asNonNegativeInt32(1_000_000)).toExtend<NonNegativeInt32>();
    });
  });
});
