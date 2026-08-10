import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveInt32,
  isPositiveInt32,
  PositiveInt32,
} from './positive-int32.mjs';

describe('PositiveInt32 test', () => {
  describe(asPositiveInt32, () => {
    test('accepts valid positive int32 values', () => {
      expect(() => asPositiveInt32(1)).not.toThrow();

      expect(() => asPositiveInt32(1000)).not.toThrow();

      expect(() => asPositiveInt32(2_147_483_647)).not.toThrow(); // 2^31 - 1
    });

    test('rejects zero', () => {
      expect(() => asPositiveInt32(0)).toThrow(TypeError);
    });

    test('rejects values outside int32 range', () => {
      expect(() => asPositiveInt32(2_147_483_648)).toThrow(TypeError); // 2^31

      expect(() => asPositiveInt32(4_294_967_296)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveInt32(-1)).toThrow(TypeError);

      expect(() => asPositiveInt32(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveInt32(Number.NaN)).toThrow(TypeError);

      expect(() => asPositiveInt32(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asPositiveInt32(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asPositiveInt32(1.2)).toThrow(TypeError);

      expect(() => asPositiveInt32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveInt32(5)).toBe(5);

      expect(asPositiveInt32(1)).toBe(1);

      expect(asPositiveInt32(2_147_483_647)).toBe(2_147_483_647);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '2147483648', value: 2_147_483_648 },
    ] as const)(
      `asPositiveInt32($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveInt32(value)).toThrow(
          new TypeError(
            `Expected a positive integer in [1, 2^31), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isPositiveInt32, () => {
    test('correctly identifies positive int32 values', () => {
      assert.isTrue(isPositiveInt32(1));

      assert.isTrue(isPositiveInt32(1000));

      assert.isTrue(isPositiveInt32(2_147_483_647));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isPositiveInt32(0));
    });

    test('correctly identifies values outside int32 range', () => {
      assert.isFalse(isPositiveInt32(2_147_483_648));

      assert.isFalse(isPositiveInt32(4_294_967_296));
    });

    test('correctly identifies negative integers', () => {
      assert.isFalse(isPositiveInt32(-1));

      assert.isFalse(isPositiveInt32(-42));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isPositiveInt32(Number.NaN));

      assert.isFalse(isPositiveInt32(Number.POSITIVE_INFINITY));

      assert.isFalse(isPositiveInt32(Number.NEGATIVE_INFINITY));

      assert.isFalse(isPositiveInt32(1.2));

      assert.isFalse(isPositiveInt32(-3.4));
    });
  });

  describe('PositiveInt32.is', () => {
    test('same as isPositiveInt32 function', () => {
      expect(PositiveInt32.is(5)).toBe(isPositiveInt32(5));

      expect(PositiveInt32.is(0)).toBe(isPositiveInt32(0));

      expect(PositiveInt32.is(-1)).toBe(isPositiveInt32(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(PositiveInt32.MIN_VALUE).toBe(1);

      expect(PositiveInt32.MAX_VALUE).toBe(2_147_483_647);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveInt32(1_000_000);

    const b = asPositiveInt32(500_000);

    test('min and max', () => {
      expect(PositiveInt32.min(a, b)).toBe(500_000);

      expect(PositiveInt32.max(a, b)).toBe(1_000_000);
    });

    test('add (with clamping to positive int32 range)', () => {
      const result = PositiveInt32.add(
        asPositiveInt32(2_147_483_000),
        asPositiveInt32(1000),
      );

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(PositiveInt32.add(a, b)).toBe(1_500_000);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveInt32.sub(a, b)).toBe(500_000);

      expect(PositiveInt32.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to positive int32 range)', () => {
      const result = PositiveInt32.mul(
        asPositiveInt32(100_000),
        asPositiveInt32(100_000),
      );

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(PositiveInt32.mul(asPositiveInt32(1000), asPositiveInt32(5))).toBe(
        5000,
      );
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveInt32.div(a, asPositiveInt32(500_000))).toBe(2);

      expect(PositiveInt32.div(asPositiveInt32(7), asPositiveInt32(3))).toBe(2);

      expect(
        PositiveInt32.div(asPositiveInt32(500_000), asPositiveInt32(1_000_000)),
      ).toBe(1); // floor(500000/1000000) = 0, clamped to 1
    });

    test('pow (with clamping to positive int32 range)', () => {
      const result = PositiveInt32.pow(
        asPositiveInt32(10_000),
        asPositiveInt32(3),
      );

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(PositiveInt32.pow(asPositiveInt32(2), asPositiveInt32(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates positive int32 values within specified range', () => {
      const min = 1;

      const max = 20;

      for (const _ of range(10)) {
        const result = PositiveInt32.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(PositiveInt32.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates values within PositiveInt32 range', () => {
      for (const _ of range(10)) {
        const result = PositiveInt32.random(1, 30);

        expect(result).toBeGreaterThanOrEqual(1);

        expect(result).toBeLessThanOrEqual(2_147_483_647);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveInt32, number>('<=');

      expectTypeOf(asPositiveInt32(1_000_000)).toExtend<PositiveInt32>();
    });
  });
});
