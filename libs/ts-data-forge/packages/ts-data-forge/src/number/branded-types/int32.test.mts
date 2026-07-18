import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asInt32, Int32, isInt32 } from './int32.mjs';
import { asNonZeroInt32 } from './non-zero-int32.mjs';

describe('Int32 test', () => {
  describe(asInt32, () => {
    test('accepts valid int32 values', () => {
      expect(() => asInt32(0)).not.toThrow();

      expect(() => asInt32(1)).not.toThrow();

      expect(() => asInt32(-1)).not.toThrow();

      expect(() => asInt32(2_147_483_647)).not.toThrow(); // 2^31 - 1

      expect(() => asInt32(-2_147_483_648)).not.toThrow(); // -2^31
    });

    test('rejects values outside int32 range', () => {
      expect(() => asInt32(2_147_483_648)).toThrow(TypeError); // 2^31

      expect(() => asInt32(-2_147_483_649)).toThrow(TypeError); // -2^31 - 1

      expect(() => asInt32(4_294_967_296)).toThrow(TypeError);

      expect(() => asInt32(-4_294_967_296)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asInt32(Number.NaN)).toThrow(TypeError);

      expect(() => asInt32(Number.POSITIVE_INFINITY)).toThrow(TypeError);

      expect(() => asInt32(Number.NEGATIVE_INFINITY)).toThrow(TypeError);

      expect(() => asInt32(1.2)).toThrow(TypeError);

      expect(() => asInt32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asInt32(5)).toBe(5);

      expect(asInt32(-10)).toBe(-10);

      expect(asInt32(0)).toBe(0);

      expect(asInt32(2_147_483_647)).toBe(2_147_483_647);

      expect(asInt32(-2_147_483_648)).toBe(-2_147_483_648);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
    ] as const)(`asInt32($name) should throw a TypeError`, ({ value }) => {
      expect(() => asInt32(value)).toThrow(
        new TypeError(`Expected an integer in [-2^31, 2^31), got: ${value}`),
      );
    });
  });

  describe(isInt32, () => {
    test('correctly identifies int32 values', () => {
      assert.isTrue(isInt32(0));

      assert.isTrue(isInt32(1));

      assert.isTrue(isInt32(-1));

      assert.isTrue(isInt32(2_147_483_647));

      assert.isTrue(isInt32(-2_147_483_648));
    });

    test('correctly identifies values outside int32 range', () => {
      assert.isFalse(isInt32(2_147_483_648));

      assert.isFalse(isInt32(-2_147_483_649));

      assert.isFalse(isInt32(4_294_967_296));

      assert.isFalse(isInt32(-4_294_967_296));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isInt32(Number.NaN));

      assert.isFalse(isInt32(Number.POSITIVE_INFINITY));

      assert.isFalse(isInt32(Number.NEGATIVE_INFINITY));

      assert.isFalse(isInt32(1.2));

      assert.isFalse(isInt32(-3.4));
    });
  });

  describe('Int32.is', () => {
    test('same as isInt32 function', () => {
      expect(Int32.is(5)).toBe(isInt32(5));

      expect(Int32.is(2_147_483_648)).toBe(isInt32(2_147_483_648));

      expect(Int32.is(-2_147_483_649)).toBe(isInt32(-2_147_483_649));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(Int32.MIN_VALUE).toBe(-2_147_483_648);

      expect(Int32.MAX_VALUE).toBe(2_147_483_647);
    });
  });

  describe('mathematical operations', () => {
    const a = asInt32(1_000_000);

    const b = asInt32(500_000);

    const c = asInt32(-300_000);

    test('abs', () => {
      expect(Int32.abs(a)).toBe(1_000_000);

      expect(Int32.abs(c)).toBe(300_000);

      expect(Int32.abs(asInt32(0))).toBe(0);
    });

    test('min and max', () => {
      expect(Int32.min(a, b)).toBe(500_000);

      expect(Int32.max(a, b)).toBe(1_000_000);

      expect(Int32.min(a, c)).toBe(-300_000);

      expect(Int32.max(a, c)).toBe(1_000_000);
    });

    test('add (with clamping)', () => {
      const result = Int32.add(asInt32(2_147_483_000), asInt32(1000));

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(Int32.add(a, b)).toBe(1_500_000);
    });

    test('sub (with clamping)', () => {
      const result = Int32.sub(asInt32(-2_147_483_000), asInt32(1000));

      expect(result).toBe(-2_147_483_648); // clamped to min

      expect(Int32.sub(a, b)).toBe(500_000);
    });

    test('mul (with clamping)', () => {
      const result = Int32.mul(asInt32(100_000), asInt32(100_000));

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(Int32.mul(asInt32(1000), asInt32(5))).toBe(5000);
    });

    test('div (floor division with clamping)', () => {
      expect(Int32.div(a, asNonZeroInt32(500_000))).toBe(2);

      expect(Int32.div(asInt32(7), asNonZeroInt32(3))).toBe(2);

      expect(Int32.div(asInt32(-7), asNonZeroInt32(3))).toBe(-3);
    });

    test('pow (with clamping)', () => {
      const result = Int32.pow(asInt32(10_000), asInt32(3));

      expect(result).toBe(2_147_483_647); // clamped to max

      expect(Int32.pow(asInt32(2), asInt32(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates int32 values within specified range', () => {
      const min = -10;

      const max = 10;

      for (const _ of range(10)) {
        const result = Int32.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(Int32.is(result));

        assert.isTrue(Number.isInteger(result));
      }
    });

    test('generates values within Int32 range', () => {
      for (const _ of range(10)) {
        const result = Int32.random(-20, 20);

        expect(result).toBeGreaterThanOrEqual(Int32.MIN_VALUE);

        expect(result).toBeLessThanOrEqual(Int32.MAX_VALUE);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<Int32, number>('<=');

      expectTypeOf(asInt32(1_000_000)).toExtend<Int32>();
    });
  });
});
