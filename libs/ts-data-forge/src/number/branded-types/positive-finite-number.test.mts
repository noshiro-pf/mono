import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveFiniteNumber,
  isPositiveFiniteNumber,
  PositiveFiniteNumber,
} from './positive-finite-number.mjs';

describe('PositiveFiniteNumber test', () => {
  describe(asPositiveFiniteNumber, () => {
    test('accepts valid positive finite numbers', () => {
      expect(() => asPositiveFiniteNumber(1)).not.toThrowError();

      expect(() => asPositiveFiniteNumber(3.14)).not.toThrowError();

      expect(() => asPositiveFiniteNumber(0.5)).not.toThrowError();

      expect(() => asPositiveFiniteNumber(Number.MIN_VALUE)).not.toThrowError();

      expect(() => asPositiveFiniteNumber(Number.MAX_VALUE)).not.toThrowError();
    });

    test('rejects zero', () => {
      expect(() => asPositiveFiniteNumber(0)).toThrowError(TypeError);

      expect(() => asPositiveFiniteNumber(-0)).toThrowError(TypeError);
    });

    test('rejects negative numbers', () => {
      expect(() => asPositiveFiniteNumber(-1)).toThrowError(TypeError);

      expect(() => asPositiveFiniteNumber(-0.1)).toThrowError(TypeError);

      expect(() => asPositiveFiniteNumber(-Number.MAX_VALUE)).toThrowError(
        TypeError,
      );
    });

    test('rejects non-finite numbers', () => {
      expect(() => asPositiveFiniteNumber(Number.NaN)).toThrowError(TypeError);

      expect(() =>
        asPositiveFiniteNumber(Number.POSITIVE_INFINITY),
      ).toThrowError(TypeError);

      expect(() =>
        asPositiveFiniteNumber(Number.NEGATIVE_INFINITY),
      ).toThrowError(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveFiniteNumber(5.5)).toBe(5.5);

      expect(asPositiveFiniteNumber(1)).toBe(1);

      expect(asPositiveFiniteNumber(10)).toBe(10);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '-1.2', value: -1.2 },
    ] as const)(
      `asPositiveFiniteNumber($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveFiniteNumber(value)).toThrowError(
          new TypeError(`Expected a positive finite number, got: ${value}`),
        );
      },
    );
  });

  describe(isPositiveFiniteNumber, () => {
    test('correctly identifies positive finite numbers', () => {
      assert.isTrue(isPositiveFiniteNumber(1));

      assert.isTrue(isPositiveFiniteNumber(3.14));

      assert.isTrue(isPositiveFiniteNumber(0.5));

      assert.isTrue(isPositiveFiniteNumber(Number.MIN_VALUE));

      assert.isTrue(isPositiveFiniteNumber(Number.MAX_VALUE));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isPositiveFiniteNumber(0));

      assert.isFalse(isPositiveFiniteNumber(-0));
    });

    test('correctly identifies negative numbers', () => {
      assert.isFalse(isPositiveFiniteNumber(-1));

      assert.isFalse(isPositiveFiniteNumber(-0.1));

      assert.isFalse(isPositiveFiniteNumber(-Number.MAX_VALUE));
    });

    test('correctly identifies non-finite numbers', () => {
      assert.isFalse(isPositiveFiniteNumber(Number.NaN));

      assert.isFalse(isPositiveFiniteNumber(Number.POSITIVE_INFINITY));

      assert.isFalse(isPositiveFiniteNumber(Number.NEGATIVE_INFINITY));
    });
  });

  describe('PositiveFiniteNumber.is', () => {
    test('same as isPositiveFiniteNumber function', () => {
      expect(PositiveFiniteNumber.is(5)).toBe(isPositiveFiniteNumber(5));

      expect(PositiveFiniteNumber.is(0)).toBe(isPositiveFiniteNumber(0));

      expect(PositiveFiniteNumber.is(-1)).toBe(isPositiveFiniteNumber(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE', () => {
      expect(PositiveFiniteNumber.MIN_VALUE).toBe(Number.MIN_VALUE);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveFiniteNumber(5.5);

    const b = asPositiveFiniteNumber(2.5);

    const c = asPositiveFiniteNumber(0.5);

    test('min and max', () => {
      expect(PositiveFiniteNumber.min(a, b)).toBe(2.5);

      expect(PositiveFiniteNumber.max(a, b)).toBe(5.5);

      expect(PositiveFiniteNumber.min(a, c)).toBe(0.5);

      expect(PositiveFiniteNumber.max(a, c)).toBe(5.5);
    });

    test('floor, ceil, round', () => {
      expect(PositiveFiniteNumber.floor(a)).toBe(5);

      expect(PositiveFiniteNumber.ceil(a)).toBe(6);

      expect(PositiveFiniteNumber.round(a)).toBe(6);

      expect(PositiveFiniteNumber.floor(b)).toBe(2);

      expect(PositiveFiniteNumber.ceil(b)).toBe(3);

      expect(PositiveFiniteNumber.round(b)).toBe(3);

      // Test edge case with values less than 1
      expect(PositiveFiniteNumber.floor(c)).toBe(0);

      expect(PositiveFiniteNumber.ceil(c)).toBe(1);

      expect(PositiveFiniteNumber.round(c)).toBe(1);
    });

    test('add (always greater than 0)', () => {
      expect(PositiveFiniteNumber.add(a, b)).toBe(8);

      expect(PositiveFiniteNumber.add(a, c)).toBe(6);
    });

    test('sub (never goes below Number.MIN_VALUE)', () => {
      const result1 = PositiveFiniteNumber.sub(a, b);

      expect(result1).toBe(3);

      const result2 = PositiveFiniteNumber.sub(b, a);

      expect(result2).toBe(Number.MIN_VALUE); // clamped to MIN_VALUE
    });

    test('mul (always greater than 0)', () => {
      expect(PositiveFiniteNumber.mul(a, b)).toBe(13.75);

      expect(PositiveFiniteNumber.mul(a, c)).toBe(2.75);
    });

    test('div (always greater than 0)', () => {
      expect(PositiveFiniteNumber.div(a, b)).toBe(2.2);

      expect(PositiveFiniteNumber.div(a, asPositiveFiniteNumber(2))).toBe(2.75);
    });

    test('pow (always greater than 0)', () => {
      expect(
        PositiveFiniteNumber.pow(
          asPositiveFiniteNumber(2),
          asPositiveFiniteNumber(3),
        ),
      ).toBe(8);

      expect(
        PositiveFiniteNumber.pow(
          asPositiveFiniteNumber(3),
          asPositiveFiniteNumber(2),
        ),
      ).toBe(9);
    });
  });

  describe('random', () => {
    test('generates positive numbers within specified range', () => {
      const min = asPositiveFiniteNumber(1.5);

      const max = asPositiveFiniteNumber(10.3);

      for (const _ of range(10)) {
        const result = PositiveFiniteNumber.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(PositiveFiniteNumber.is(result));

        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates numbers starting from MIN_VALUE', () => {
      const min = asPositiveFiniteNumber(Number.MIN_VALUE);

      const max = asPositiveFiniteNumber(1);

      for (const _ of range(10)) {
        const result = PositiveFiniteNumber.random(min, max);

        expect(result).toBeGreaterThanOrEqual(Number.MIN_VALUE);

        expect(result).toBeLessThanOrEqual(1);

        expect(result).toBeGreaterThan(0);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveFiniteNumber, number>('<=');

      expectTypeOf(
        asPositiveFiniteNumber(5.5),
      ).toExtend<PositiveFiniteNumber>();
    });
  });
});
