import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonZeroInt16,
  isNonZeroInt16,
  NonZeroInt16,
} from './non-zero-int16.mjs';

describe('NonZeroInt16 test', () => {
  describe(asNonZeroInt16, () => {
    test('accepts valid non-zero int16 values', () => {
      expect(() => asNonZeroInt16(1)).not.toThrow();

      expect(() => asNonZeroInt16(-1)).not.toThrow();

      expect(() => asNonZeroInt16(32_767)).not.toThrow(); // 2^15 - 1

      expect(() => asNonZeroInt16(-32_768)).not.toThrow(); // -2^15
    });

    test('rejects zero', () => {
      expect(() => asNonZeroInt16(0)).toThrow(TypeError);
    });

    test('rejects values outside int16 range', () => {
      expect(() => asNonZeroInt16(32_768)).toThrow(TypeError); // 2^15

      expect(() => asNonZeroInt16(-32_769)).toThrow(TypeError); // -2^15 - 1

      expect(() => asNonZeroInt16(65_536)).toThrow(TypeError);

      expect(() => asNonZeroInt16(-65_536)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonZeroInt16(Number.NaN)).toThrow(TypeError);

      expect(() => asNonZeroInt16(Number.POSITIVE_INFINITY)).toThrow(TypeError);

      expect(() => asNonZeroInt16(Number.NEGATIVE_INFINITY)).toThrow(TypeError);

      expect(() => asNonZeroInt16(1.2)).toThrow(TypeError);

      expect(() => asNonZeroInt16(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonZeroInt16(5)).toBe(5);

      expect(asNonZeroInt16(-10)).toBe(-10);

      expect(asNonZeroInt16(32_767)).toBe(32_767);

      expect(asNonZeroInt16(-32_768)).toBe(-32_768);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '32768', value: 32_768 },
      { name: '-32769', value: -32_769 },
    ] as const)(
      `asNonZeroInt16($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asNonZeroInt16(value)).toThrow(
          new TypeError(
            `Expected a non-zero integer in [-2^15, 2^15), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isNonZeroInt16, () => {
    test('correctly identifies non-zero int16 values', () => {
      assert.isTrue(isNonZeroInt16(1));

      assert.isTrue(isNonZeroInt16(-1));

      assert.isTrue(isNonZeroInt16(32_767));

      assert.isTrue(isNonZeroInt16(-32_768));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isNonZeroInt16(0));
    });

    test('correctly identifies values outside int16 range', () => {
      assert.isFalse(isNonZeroInt16(32_768));

      assert.isFalse(isNonZeroInt16(-32_769));

      assert.isFalse(isNonZeroInt16(65_536));

      assert.isFalse(isNonZeroInt16(-65_536));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isNonZeroInt16(Number.NaN));

      assert.isFalse(isNonZeroInt16(Number.POSITIVE_INFINITY));

      assert.isFalse(isNonZeroInt16(Number.NEGATIVE_INFINITY));

      assert.isFalse(isNonZeroInt16(1.2));

      assert.isFalse(isNonZeroInt16(-3.4));
    });
  });

  describe('NonZeroInt16.is', () => {
    test('same as isNonZeroInt16 function', () => {
      expect(NonZeroInt16.is(5)).toBe(isNonZeroInt16(5));

      expect(NonZeroInt16.is(0)).toBe(isNonZeroInt16(0));

      expect(NonZeroInt16.is(-1)).toBe(isNonZeroInt16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(NonZeroInt16.MIN_VALUE).toBe(-32_768);

      expect(NonZeroInt16.MAX_VALUE).toBe(32_767);
    });
  });

  describe('mathematical operations', () => {
    const a = asNonZeroInt16(100);

    const b = asNonZeroInt16(50);

    const c = asNonZeroInt16(-30);

    test('abs', () => {
      expect(NonZeroInt16.abs(a)).toBe(100);

      expect(NonZeroInt16.abs(c)).toBe(30);
    });

    test('min and max', () => {
      expect(NonZeroInt16.min(a, b)).toBe(50);

      expect(NonZeroInt16.max(a, b)).toBe(100);

      expect(NonZeroInt16.min(a, c)).toBe(-30);

      expect(NonZeroInt16.max(a, c)).toBe(100);
    });

    test('add (with clamping)', () => {
      const result = NonZeroInt16.add(
        asNonZeroInt16(32_000),
        asNonZeroInt16(1000),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(NonZeroInt16.add(a, b)).toBe(150);
    });

    test('sub (with clamping)', () => {
      const result = NonZeroInt16.sub(
        asNonZeroInt16(-32_000),
        asNonZeroInt16(1000),
      );

      expect(result).toBe(-32_768); // clamped to min

      expect(NonZeroInt16.sub(a, b)).toBe(50);
    });

    test('mul (with clamping)', () => {
      const result = NonZeroInt16.mul(
        asNonZeroInt16(1000),
        asNonZeroInt16(100),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(NonZeroInt16.mul(asNonZeroInt16(10), asNonZeroInt16(5))).toBe(50);
    });

    test('div (floor division with clamping)', () => {
      expect(NonZeroInt16.div(a, asNonZeroInt16(50))).toBe(2);

      expect(NonZeroInt16.div(asNonZeroInt16(7), asNonZeroInt16(3))).toBe(2);

      expect(NonZeroInt16.div(asNonZeroInt16(-7), asNonZeroInt16(3))).toBe(-3);
    });

    test('pow (with clamping)', () => {
      const result = NonZeroInt16.pow(asNonZeroInt16(200), asNonZeroInt16(3));

      expect(result).toBe(32_767); // clamped to max

      expect(NonZeroInt16.pow(asNonZeroInt16(2), asNonZeroInt16(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates non-zero int16 values within specified range', () => {
      const min = -10;

      const max = 10;

      for (const _ of range(10)) {
        const result = NonZeroInt16.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(NonZeroInt16.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).not.toBe(0);
      }
    });

    test('generates values within NonZeroInt16 range', () => {
      for (const _ of range(10)) {
        const result = NonZeroInt16.random(-20, 20);

        expect(result).toBeGreaterThanOrEqual(-32_768);

        expect(result).toBeLessThanOrEqual(32_767);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonZeroInt16, number>('<=');

      expectTypeOf(asNonZeroInt16(100)).toExtend<NonZeroInt16>();
    });
  });
});
