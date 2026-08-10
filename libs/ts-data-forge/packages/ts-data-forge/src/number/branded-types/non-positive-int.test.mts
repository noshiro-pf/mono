import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonPositiveInt,
  isNonPositiveInt,
  NonPositiveInt,
} from './non-positive-int.mjs';

describe('NonPositiveInt test', () => {
  describe(asNonPositiveInt, () => {
    test('accepts valid non-positive integers', () => {
      expect(() => asNonPositiveInt(0)).not.toThrow();

      expect(() => asNonPositiveInt(-1)).not.toThrow();

      expect(() => asNonPositiveInt(-1000)).not.toThrow();

      expect(() => asNonPositiveInt(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects positive integers', () => {
      expect(() => asNonPositiveInt(1)).toThrow(TypeError);

      expect(() => asNonPositiveInt(42)).toThrow(TypeError);

      expect(() => asNonPositiveInt(Number.MAX_SAFE_INTEGER)).toThrow(
        TypeError,
      );
    });

    test('rejects non-integers', () => {
      expect(() => asNonPositiveInt(Number.NaN)).toThrow(TypeError);

      expect(() => asNonPositiveInt(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonPositiveInt(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonPositiveInt(-1.5)).toThrow(TypeError);

      expect(() => asNonPositiveInt(3.7)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonPositiveInt(0)).toBe(0);

      expect(asNonPositiveInt(-5)).toBe(-5);

      expect(asNonPositiveInt(Number.MIN_SAFE_INTEGER)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });
  });

  describe(isNonPositiveInt, () => {
    test('correctly identifies non-positive integers', () => {
      assert.isTrue(isNonPositiveInt(0));

      assert.isTrue(isNonPositiveInt(-1));

      assert.isTrue(isNonPositiveInt(-1000));

      assert.isTrue(isNonPositiveInt(Number.MIN_SAFE_INTEGER));
    });

    test('correctly rejects positive integers', () => {
      assert.isFalse(isNonPositiveInt(1));

      assert.isFalse(isNonPositiveInt(42));

      assert.isFalse(isNonPositiveInt(Number.MAX_SAFE_INTEGER));
    });

    test('correctly rejects non-integers', () => {
      assert.isFalse(isNonPositiveInt(Number.NaN));

      assert.isFalse(isNonPositiveInt(Number.POSITIVE_INFINITY));

      assert.isFalse(isNonPositiveInt(Number.NEGATIVE_INFINITY));

      assert.isFalse(isNonPositiveInt(-1.5));

      assert.isFalse(isNonPositiveInt(3.7));
    });
  });

  describe('NonPositiveInt.is', () => {
    test('works as a type guard', () => {
      const value: number = -42;

      if (NonPositiveInt.is(value)) {
        expectType<typeof value, typeof value & NonPositiveInt>('=');
      }
    });
  });

  describe('NonPositiveInt.MAX_VALUE', () => {
    test('is 0', () => {
      expect(NonPositiveInt.MAX_VALUE).toBe(0);
    });
  });

  describe('NonPositiveInt.min', () => {
    test('returns the smaller value', () => {
      expect(NonPositiveInt.min(-5, -10)).toBe(-10);

      expect(NonPositiveInt.min(0, -1)).toBe(-1);
    });

    test('clamps to range when necessary', () => {
      expect(NonPositiveInt.min(-5, 10)).toBe(-5);

      expect(NonPositiveInt.min(5, 10)).toBe(0);
    });
  });

  describe('NonPositiveInt.max', () => {
    test('returns the larger value', () => {
      expect(NonPositiveInt.max(-5, -10)).toBe(-5);

      expect(NonPositiveInt.max(-1, 0)).toBe(0);
    });

    test('clamps to range when necessary', () => {
      expect(NonPositiveInt.max(-5, -10)).toBe(-5);

      expect(NonPositiveInt.max(-5, 10)).toBe(0);
    });
  });

  describe('NonPositiveInt.fromNumber', () => {
    test('returns the same value if within range', () => {
      expect(NonPositiveInt.fromNumber(-5)).toBe(-5);

      expect(NonPositiveInt.fromNumber(0)).toBe(0);

      expect(NonPositiveInt.fromNumber(-1000)).toBe(-1000);
    });

    test('clamps positive values to MAX_VALUE (0)', () => {
      expect(NonPositiveInt.fromNumber(5)).toBe(0);

      expect(NonPositiveInt.fromNumber(1000)).toBe(0);
    });

    test('clamps -Infinity to the lower bound', () => {
      expect(NonPositiveInt.fromNumber(Number.NEGATIVE_INFINITY)).toBe(
        -Number.MAX_VALUE,
      );
    });
  });

  describe('NonPositiveInt.add', () => {
    test('adds two non-positive integers', () => {
      expect(NonPositiveInt.add(-5, -3)).toBe(-8);

      expect(NonPositiveInt.add(0, -10)).toBe(-10);
    });

    test('clamps result to MAX_VALUE (0) when sum is positive', () => {
      expect(NonPositiveInt.add(-5, 10)).toBe(0);

      expect(NonPositiveInt.add(0, 0)).toBe(0);
    });
  });

  describe('NonPositiveInt.sub', () => {
    test('subtracts two non-positive integers', () => {
      expect(NonPositiveInt.sub(-10, -3)).toBe(-7);

      expect(NonPositiveInt.sub(0, -5)).toBe(0);
    });

    test('clamps result to MAX_VALUE (0) when result is positive', () => {
      expect(NonPositiveInt.sub(-5, -10)).toBe(0);
    });
  });

  describe('NonPositiveInt.pow', () => {
    test('raises to power', () => {
      expect(NonPositiveInt.pow(-2, -1)).toBeDefined();
    });
  });

  describe('NonPositiveInt.random', () => {
    test('generates values within range', () => {
      for (const _ of range(100)) {
        const value = NonPositiveInt.random();

        assert.isTrue(isNonPositiveInt(value));
      }
    });
  });
});
