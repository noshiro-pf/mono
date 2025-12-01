import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveInt16,
  isPositiveInt16,
  PositiveInt16,
} from './positive-int16.mjs';

describe('PositiveInt16 test', () => {
  describe(asPositiveInt16, () => {
    test('accepts valid positive int16 values', () => {
      expect(() => asPositiveInt16(1)).not.toThrowError();

      expect(() => asPositiveInt16(1000)).not.toThrowError();

      expect(() => asPositiveInt16(32_767)).not.toThrowError(); // 2^15 - 1
    });

    test('rejects zero', () => {
      expect(() => asPositiveInt16(0)).toThrowError(TypeError);
    });

    test('rejects values outside int16 range', () => {
      expect(() => asPositiveInt16(32_768)).toThrowError(TypeError); // 2^15

      expect(() => asPositiveInt16(65_536)).toThrowError(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveInt16(-1)).toThrowError(TypeError);

      expect(() => asPositiveInt16(-42)).toThrowError(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveInt16(Number.NaN)).toThrowError(TypeError);

      expect(() => asPositiveInt16(Number.POSITIVE_INFINITY)).toThrowError(
        TypeError,
      );

      expect(() => asPositiveInt16(Number.NEGATIVE_INFINITY)).toThrowError(
        TypeError,
      );

      expect(() => asPositiveInt16(1.2)).toThrowError(TypeError);

      expect(() => asPositiveInt16(-3.4)).toThrowError(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveInt16(5)).toBe(5);

      expect(asPositiveInt16(1)).toBe(1);

      expect(asPositiveInt16(32_767)).toBe(32_767);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '32768', value: 32_768 },
    ] as const)(
      `asPositiveInt16($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveInt16(value)).toThrowError(
          new TypeError(
            `Expected a positive integer in [1, 2^15), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isPositiveInt16, () => {
    test('correctly identifies positive int16 values', () => {
      assert.isTrue(isPositiveInt16(1));

      assert.isTrue(isPositiveInt16(1000));

      assert.isTrue(isPositiveInt16(32_767));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isPositiveInt16(0));
    });

    test('correctly identifies values outside int16 range', () => {
      assert.isFalse(isPositiveInt16(32_768));

      assert.isFalse(isPositiveInt16(65_536));
    });

    test('correctly identifies negative integers', () => {
      assert.isFalse(isPositiveInt16(-1));

      assert.isFalse(isPositiveInt16(-42));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isPositiveInt16(Number.NaN));

      assert.isFalse(isPositiveInt16(Number.POSITIVE_INFINITY));

      assert.isFalse(isPositiveInt16(Number.NEGATIVE_INFINITY));

      assert.isFalse(isPositiveInt16(1.2));

      assert.isFalse(isPositiveInt16(-3.4));
    });
  });

  describe('PositiveInt16.is', () => {
    test('same as isPositiveInt16 function', () => {
      expect(PositiveInt16.is(5)).toBe(isPositiveInt16(5));

      expect(PositiveInt16.is(0)).toBe(isPositiveInt16(0));

      expect(PositiveInt16.is(-1)).toBe(isPositiveInt16(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(PositiveInt16.MIN_VALUE).toBe(1);

      expect(PositiveInt16.MAX_VALUE).toBe(32_767);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveInt16(100);

    const b = asPositiveInt16(50);

    test('min and max', () => {
      expect(PositiveInt16.min(a, b)).toBe(50);

      expect(PositiveInt16.max(a, b)).toBe(100);
    });

    test('add (with clamping to positive int16 range)', () => {
      const result = PositiveInt16.add(
        asPositiveInt16(32_000),
        asPositiveInt16(1000),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(PositiveInt16.add(a, b)).toBe(150);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveInt16.sub(a, b)).toBe(50);

      expect(PositiveInt16.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to positive int16 range)', () => {
      const result = PositiveInt16.mul(
        asPositiveInt16(1000),
        asPositiveInt16(100),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(PositiveInt16.mul(asPositiveInt16(10), asPositiveInt16(5))).toBe(
        50,
      );
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveInt16.div(a, asPositiveInt16(50))).toBe(2);

      expect(PositiveInt16.div(asPositiveInt16(7), asPositiveInt16(3))).toBe(2);

      expect(PositiveInt16.div(asPositiveInt16(50), asPositiveInt16(100))).toBe(
        1,
      ); // floor(50/100) = 0, clamped to 1
    });

    test('pow (with clamping to positive int16 range)', () => {
      const result = PositiveInt16.pow(
        asPositiveInt16(200),
        asPositiveInt16(3),
      );

      expect(result).toBe(32_767); // clamped to max

      expect(PositiveInt16.pow(asPositiveInt16(2), asPositiveInt16(3))).toBe(8);
    });
  });

  describe('random', () => {
    test('generates positive int16 values within specified range', () => {
      const min = 1;

      const max = 20;

      for (const _ of range(10)) {
        const result = PositiveInt16.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(PositiveInt16.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates values within PositiveInt16 range', () => {
      for (const _ of range(10)) {
        const result = PositiveInt16.random(1, 30);

        expect(result).toBeGreaterThanOrEqual(1);

        expect(result).toBeLessThanOrEqual(32_767);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveInt16, number>('<=');

      expectTypeOf(asPositiveInt16(100)).toExtend<PositiveInt16>();
    });
  });
});
