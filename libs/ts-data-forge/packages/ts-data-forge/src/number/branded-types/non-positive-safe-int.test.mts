import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNonPositiveSafeInt,
  isNonPositiveSafeInt,
  NonPositiveSafeInt,
} from './non-positive-safe-int.mjs';

describe('NonPositiveSafeInt test', () => {
  describe(asNonPositiveSafeInt, () => {
    test('accepts valid non-positive safe integer values', () => {
      expect(() => asNonPositiveSafeInt(0)).not.toThrow();

      expect(() => asNonPositiveSafeInt(-1)).not.toThrow();

      expect(() => asNonPositiveSafeInt(-1000)).not.toThrow();

      expect(() => asNonPositiveSafeInt(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects positive integers', () => {
      expect(() => asNonPositiveSafeInt(1)).toThrow(TypeError);

      expect(() => asNonPositiveSafeInt(42)).toThrow(TypeError);

      expect(() => asNonPositiveSafeInt(Number.MAX_SAFE_INTEGER)).toThrow(
        TypeError,
      );
    });

    test('rejects values outside safe integer range', () => {
      expect(() => asNonPositiveSafeInt(Number.MIN_SAFE_INTEGER - 1)).toThrow(
        TypeError,
      );

      expect(() => asNonPositiveSafeInt(Number.MAX_SAFE_INTEGER + 1)).toThrow(
        TypeError,
      );
    });

    test('rejects non-integers', () => {
      expect(() => asNonPositiveSafeInt(Number.NaN)).toThrow(TypeError);

      expect(() => asNonPositiveSafeInt(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonPositiveSafeInt(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNonPositiveSafeInt(-1.2)).toThrow(TypeError);

      expect(() => asNonPositiveSafeInt(3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonPositiveSafeInt(0)).toBe(0);

      expect(asNonPositiveSafeInt(-5)).toBe(-5);

      expect(asNonPositiveSafeInt(Number.MIN_SAFE_INTEGER)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });

    test('throws TypeError for invalid values', () => {
      expect(() => asNonPositiveSafeInt(1)).toThrow(TypeError);

      expect(() => asNonPositiveSafeInt(Number.MIN_SAFE_INTEGER - 1)).toThrow(
        TypeError,
      );

      expect(() => asNonPositiveSafeInt(Number.NaN)).toThrow(TypeError);
    });
  });

  describe(isNonPositiveSafeInt, () => {
    test('correctly identifies non-positive safe integers', () => {
      assert.isTrue(isNonPositiveSafeInt(0));

      assert.isTrue(isNonPositiveSafeInt(-1));

      assert.isTrue(isNonPositiveSafeInt(-1000));

      assert.isTrue(isNonPositiveSafeInt(Number.MIN_SAFE_INTEGER));
    });

    test('correctly identifies positive integers', () => {
      assert.isFalse(isNonPositiveSafeInt(1));

      assert.isFalse(isNonPositiveSafeInt(42));

      assert.isFalse(isNonPositiveSafeInt(Number.MAX_SAFE_INTEGER));
    });

    test('correctly identifies values outside safe integer range', () => {
      assert.isFalse(isNonPositiveSafeInt(Number.MIN_SAFE_INTEGER - 1));

      assert.isFalse(isNonPositiveSafeInt(Number.MAX_SAFE_INTEGER + 1));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isNonPositiveSafeInt(Number.NaN));

      assert.isFalse(isNonPositiveSafeInt(Number.POSITIVE_INFINITY));

      assert.isFalse(isNonPositiveSafeInt(Number.NEGATIVE_INFINITY));

      assert.isFalse(isNonPositiveSafeInt(-1.2));

      assert.isFalse(isNonPositiveSafeInt(3.4));
    });
  });

  describe('NonPositiveSafeInt.is', () => {
    test('works as a type guard', () => {
      const value: number = -42;

      if (NonPositiveSafeInt.is(value)) {
        expectType<typeof value, typeof value & NonPositiveSafeInt>('=');
      }
    });
  });

  describe('NonPositiveSafeInt.MIN_VALUE', () => {
    test('is Number.MIN_SAFE_INTEGER', () => {
      expect(NonPositiveSafeInt.MIN_VALUE).toBe(Number.MIN_SAFE_INTEGER);
    });
  });

  describe('NonPositiveSafeInt.MAX_VALUE', () => {
    test('is 0', () => {
      expect(NonPositiveSafeInt.MAX_VALUE).toBe(0);
    });
  });

  describe('NonPositiveSafeInt.min', () => {
    test('returns the smaller value', () => {
      expect(NonPositiveSafeInt.min(-5, -10)).toBe(-10);

      expect(NonPositiveSafeInt.min(0, -1)).toBe(-1);
    });

    test('clamps to range when necessary', () => {
      expect(NonPositiveSafeInt.min(-5, 10)).toBe(-5);

      expect(NonPositiveSafeInt.min(5, 10)).toBe(0);
    });
  });

  describe('NonPositiveSafeInt.max', () => {
    test('returns the larger value', () => {
      expect(NonPositiveSafeInt.max(-5, -10)).toBe(-5);

      expect(NonPositiveSafeInt.max(-1, 0)).toBe(0);
    });

    test('clamps to range when necessary', () => {
      expect(NonPositiveSafeInt.max(-5, -10)).toBe(-5);

      expect(NonPositiveSafeInt.max(-5, 10)).toBe(0);
    });
  });

  describe('NonPositiveSafeInt.clamp', () => {
    test('returns the same value if within range', () => {
      expect(NonPositiveSafeInt.clamp(-5)).toBe(-5);

      expect(NonPositiveSafeInt.clamp(0)).toBe(0);

      expect(NonPositiveSafeInt.clamp(-1000)).toBe(-1000);
    });

    test('clamps positive values to MAX_VALUE (0)', () => {
      expect(NonPositiveSafeInt.clamp(5)).toBe(0);

      expect(NonPositiveSafeInt.clamp(1000)).toBe(0);
    });

    test('clamps out-of-range negative values to MIN_VALUE', () => {
      expect(NonPositiveSafeInt.clamp(Number.MIN_SAFE_INTEGER - 1)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });
  });

  describe('NonPositiveSafeInt.add', () => {
    test('adds two non-positive integers', () => {
      expect(NonPositiveSafeInt.add(-5, -3)).toBe(-8);

      expect(NonPositiveSafeInt.add(0, -10)).toBe(-10);
    });

    test('clamps result to MAX_VALUE (0) when sum is positive', () => {
      expect(NonPositiveSafeInt.add(-5, 10)).toBe(0);

      expect(NonPositiveSafeInt.add(0, 0)).toBe(0);
    });
  });

  describe('NonPositiveSafeInt.sub', () => {
    test('subtracts two non-positive integers', () => {
      expect(NonPositiveSafeInt.sub(-10, -3)).toBe(-7);

      expect(NonPositiveSafeInt.sub(0, -5)).toBe(0);
    });

    test('clamps result to MAX_VALUE (0) when result is positive', () => {
      expect(NonPositiveSafeInt.sub(-5, -10)).toBe(0);
    });
  });

  describe('NonPositiveSafeInt.random', () => {
    test('generates values within range', () => {
      for (const _ of range(100)) {
        const value = NonPositiveSafeInt.random();

        assert.isTrue(isNonPositiveSafeInt(value));
      }
    });
  });
});
