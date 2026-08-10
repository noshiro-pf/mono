import { type PositiveInt } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asNegativeInt, isNegativeInt, NegativeInt } from './negative-int.mjs';

describe('NegativeInt test', () => {
  describe(asNegativeInt, () => {
    test('accepts valid negative integers', () => {
      expect(() => asNegativeInt(-1)).not.toThrow();

      expect(() => asNegativeInt(-1000)).not.toThrow();

      expect(() => asNegativeInt(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects zero and positive integers', () => {
      expect(() => asNegativeInt(0)).toThrow(TypeError);

      expect(() => asNegativeInt(1)).toThrow(TypeError);

      expect(() => asNegativeInt(Number.MAX_SAFE_INTEGER)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNegativeInt(Number.NaN)).toThrow(TypeError);

      expect(() => asNegativeInt(Number.NEGATIVE_INFINITY)).toThrow(TypeError);

      expect(() => asNegativeInt(-1.5)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNegativeInt(-5)).toBe(-5);

      expect(asNegativeInt(Number.MIN_SAFE_INTEGER)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });
  });

  describe(isNegativeInt, () => {
    test('correctly identifies negative integers', () => {
      assert.isTrue(isNegativeInt(-1));

      assert.isTrue(isNegativeInt(-1000));

      assert.isFalse(isNegativeInt(0));

      assert.isFalse(isNegativeInt(1));

      assert.isFalse(isNegativeInt(-1.5));
    });
  });

  describe('NegativeInt.is', () => {
    test('works as a type guard', () => {
      const value: number = -42;

      if (NegativeInt.is(value)) {
        expectType<typeof value, typeof value & NegativeInt>('=');
      }
    });
  });

  describe('NegativeInt.MAX_VALUE', () => {
    test('is -1', () => {
      expect(NegativeInt.MAX_VALUE).toBe(-1);
    });
  });

  describe('NegativeInt.abs', () => {
    test('returns the absolute value as a positive integer', () => {
      expect(NegativeInt.abs(asNegativeInt(-5))).toBe(5);

      expect(NegativeInt.abs(asNegativeInt(-1))).toBe(1);
    });

    test('result type is PositiveInt', () => {
      expectType<ReturnType<typeof NegativeInt.abs>, PositiveInt>('=');
    });
  });

  describe('NegativeInt.min', () => {
    test('returns the smaller value', () => {
      expect(NegativeInt.min(-5, -10)).toBe(-10);

      expect(NegativeInt.min(-1, -2)).toBe(-2);
    });
  });

  describe('NegativeInt.max', () => {
    test('returns the larger value', () => {
      expect(NegativeInt.max(-5, -10)).toBe(-5);

      expect(NegativeInt.max(-1, -2)).toBe(-1);
    });
  });

  describe('NegativeInt.fromNumber', () => {
    test('returns the same value if within range', () => {
      expect(NegativeInt.fromNumber(-5)).toBe(-5);

      expect(NegativeInt.fromNumber(-1000)).toBe(-1000);
    });

    test('clamps non-negative values to MAX_VALUE (-1)', () => {
      expect(NegativeInt.fromNumber(0)).toBe(-1);

      expect(NegativeInt.fromNumber(5)).toBe(-1);
    });
  });

  describe('NegativeInt.add', () => {
    test('adds two negative integers', () => {
      expect(NegativeInt.add(-5, -3)).toBe(-8);

      expect(NegativeInt.add(-1, -1)).toBe(-2);
    });
  });

  describe('NegativeInt.sub', () => {
    test('subtracts two negative integers', () => {
      expect(NegativeInt.sub(-10, -3)).toBe(-7);
    });

    test('clamps result to MAX_VALUE (-1) when result is non-negative', () => {
      expect(NegativeInt.sub(-3, -10)).toBe(-1);
    });
  });

  describe('NegativeInt.pow', () => {
    test('raises to power', () => {
      expect(NegativeInt.pow(-2, -1)).toBeDefined();
    });
  });

  describe('NegativeInt.random', () => {
    test('generates values within range', () => {
      for (const _ of range(100)) {
        const value = NegativeInt.random();

        assert.isTrue(isNegativeInt(value));
      }
    });
  });
});
