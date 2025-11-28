import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonZeroUint32,
  isNonZeroUint32,
  NonZeroUint32,
} from './non-zero-uint32.mjs';

describe('NonZeroUint32 test', () => {
  describe(asNonZeroUint32, () => {
    test('accepts valid non-zero uint32 values', () => {
      expect(() => asNonZeroUint32(1)).not.toThrow();

      expect(() => asNonZeroUint32(1000)).not.toThrow();

      expect(() => asNonZeroUint32(4_294_967_295)).not.toThrow(); // 2^32 - 1

      expect(() => asNonZeroUint32(2_147_483_648)).not.toThrow(); // 2^31
    });

    test('rejects zero', () => {
      expect(() => asNonZeroUint32(0)).toThrow(TypeError);
    });

    test('rejects values outside uint32 range', () => {
      expect(() => asNonZeroUint32(4_294_967_296)).toThrow(TypeError); // 2^32

      expect(() => asNonZeroUint32(10_000_000_000)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asNonZeroUint32(-1)).toThrow(TypeError);

      expect(() => asNonZeroUint32(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonZeroUint32(Number.NaN)).toThrow(TypeError);

      expect(() => asNonZeroUint32(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonZeroUint32(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonZeroUint32(1.2)).toThrow(TypeError);

      expect(() => asNonZeroUint32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonZeroUint32(5)).toBe(5);

      expect(asNonZeroUint32(1)).toBe(1);

      expect(asNonZeroUint32(4_294_967_295)).toBe(4_294_967_295);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '4294967296', value: 4_294_967_296 },
    ] as const)(
      `asNonZeroUint32($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonZeroUint32(value)).toThrow(
          new TypeError(
            `Expected a non-zero integer in [1, 2^32), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isNonZeroUint32, () => {
    test('correctly identifies non-zero uint32 values', () => {
      assert.isTrue(isNonZeroUint32(1));

      assert.isTrue(isNonZeroUint32(1000));

      assert.isTrue(isNonZeroUint32(4_294_967_295));

      assert.isTrue(isNonZeroUint32(2_147_483_648));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isNonZeroUint32(0));
    });

    test('correctly identifies values outside uint32 range', () => {
      assert.isFalse(isNonZeroUint32(4_294_967_296));

      assert.isFalse(isNonZeroUint32(10_000_000_000));
    });

    test('correctly identifies negative integers', () => {
      assert.isFalse(isNonZeroUint32(-1));

      assert.isFalse(isNonZeroUint32(-42));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isNonZeroUint32(Number.NaN));

      assert.isFalse(isNonZeroUint32(Number.POSITIVE_INFINITY));

      assert.isFalse(isNonZeroUint32(Number.NEGATIVE_INFINITY));

      assert.isFalse(isNonZeroUint32(1.2));

      assert.isFalse(isNonZeroUint32(-3.4));
    });
  });

  describe('NonZeroUint32.is', () => {
    test('same as isNonZeroUint32 function', () => {
      expect(NonZeroUint32.is(5)).toBe(isNonZeroUint32(5));

      expect(NonZeroUint32.is(0)).toBe(isNonZeroUint32(0));

      expect(NonZeroUint32.is(-1)).toBe(isNonZeroUint32(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(NonZeroUint32.MIN_VALUE).toBe(1);

      expect(NonZeroUint32.MAX_VALUE).toBe(4_294_967_295);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonZeroUint32(1_000_000);

    const b = asNonZeroUint32(500_000);

    test('min and max', () => {
      expect(NonZeroUint32.min(a, b)).toBe(500_000);

      expect(NonZeroUint32.max(a, b)).toBe(1_000_000);
    });

    test('add (with clamping to non-zero uint32 range)', () => {
      const result = NonZeroUint32.add(
        asNonZeroUint32(4_294_967_000),
        asNonZeroUint32(1000),
      );

      expect(result).toBe(4_294_967_295); // clamped to max

      expect(NonZeroUint32.add(a, b)).toBe(1_500_000);
    });

    test('sub (never goes below 1)', () => {
      expect(NonZeroUint32.sub(a, b)).toBe(500_000);

      expect(NonZeroUint32.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to non-zero uint32 range)', () => {
      const result = NonZeroUint32.mul(
        asNonZeroUint32(100_000),
        asNonZeroUint32(100_000),
      );

      expect(result).toBe(4_294_967_295); // clamped to max

      expect(NonZeroUint32.mul(asNonZeroUint32(1000), asNonZeroUint32(5))).toBe(
        5000,
      );
    });

    test('div (floor division, never goes below 1)', () => {
      expect(NonZeroUint32.div(a, asNonZeroUint32(500_000))).toBe(2);

      expect(NonZeroUint32.div(asNonZeroUint32(7), asNonZeroUint32(3))).toBe(2);

      expect(
        NonZeroUint32.div(asNonZeroUint32(500_000), asNonZeroUint32(1_000_000)),
      ).toBe(1); // floor(500000/1000000) = 0, clamped to 1
    });

    test('pow (with clamping to non-zero uint32 range)', () => {
      const result = NonZeroUint32.pow(
        asNonZeroUint32(10_000),
        asNonZeroUint32(3),
      );

      expect(result).toBe(4_294_967_295); // clamped to max

      expect(NonZeroUint32.pow(asNonZeroUint32(2), asNonZeroUint32(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates non-zero uint32 values within specified range', () => {
      const min = 1;

      const max = 20;

      for (const _ of range(10)) {
        const result = NonZeroUint32.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(NonZeroUint32.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).not.toBe(0);
      }
    });

    test('generates values within NonZeroUint32 range', () => {
      for (const _ of range(10)) {
        const result = NonZeroUint32.random(1, 30);

        expect(result).toBeGreaterThanOrEqual(1);

        expect(result).toBeLessThanOrEqual(4_294_967_295);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonZeroUint32, number>('<=');

      expectTypeOf(asNonZeroUint32(1_000_000)).toExtend<NonZeroUint32>();
    });
  });
});
