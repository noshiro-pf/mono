import { type PositiveSafeInt } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNegativeSafeInt,
  isNegativeSafeInt,
  NegativeSafeInt,
} from './negative-safe-int.mjs';

describe('NegativeSafeInt test', () => {
  describe(asNegativeSafeInt, () => {
    test('accepts valid negative safe integers', () => {
      expect(() => asNegativeSafeInt(-1)).not.toThrow();

      expect(() => asNegativeSafeInt(-1000)).not.toThrow();

      expect(() => asNegativeSafeInt(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects zero and positive integers', () => {
      expect(() => asNegativeSafeInt(0)).toThrow(TypeError);

      expect(() => asNegativeSafeInt(1)).toThrow(TypeError);
    });

    test('rejects unsafe and non-integers', () => {
      expect(() => asNegativeSafeInt(Number.MIN_SAFE_INTEGER - 1)).toThrow(
        TypeError,
      );

      expect(() => asNegativeSafeInt(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asNegativeSafeInt(-1.5)).toThrow(TypeError);
    });
  });

  describe(isNegativeSafeInt, () => {
    test('correctly identifies negative safe integers', () => {
      assert.isTrue(isNegativeSafeInt(-1));

      assert.isTrue(isNegativeSafeInt(Number.MIN_SAFE_INTEGER));

      assert.isFalse(isNegativeSafeInt(0));

      assert.isFalse(isNegativeSafeInt(1));

      assert.isFalse(isNegativeSafeInt(Number.MIN_SAFE_INTEGER - 1));
    });
  });

  describe('NegativeSafeInt.is', () => {
    test('works as a type guard', () => {
      const value: number = -42;

      if (NegativeSafeInt.is(value)) {
        expectType<typeof value, typeof value & NegativeSafeInt>('=');
      }
    });
  });

  describe('NegativeSafeInt.MAX_VALUE / MIN_VALUE', () => {
    test('has the expected bounds', () => {
      expect(NegativeSafeInt.MAX_VALUE).toBe(-1);

      expect(NegativeSafeInt.MIN_VALUE).toBe(Number.MIN_SAFE_INTEGER);
    });
  });

  describe('NegativeSafeInt.abs', () => {
    test('returns the absolute value as a positive safe integer', () => {
      expect(NegativeSafeInt.abs(asNegativeSafeInt(-5))).toBe(5);
    });

    test('result type is PositiveSafeInt', () => {
      expectType<ReturnType<typeof NegativeSafeInt.abs>, PositiveSafeInt>('=');
    });
  });

  describe('NegativeSafeInt.min / max', () => {
    test('returns the expected extremum', () => {
      expect(NegativeSafeInt.min(-5, -10)).toBe(-10);

      expect(NegativeSafeInt.max(-5, -10)).toBe(-5);
    });
  });

  describe('NegativeSafeInt.clamp', () => {
    test('clamps to the valid range', () => {
      expect(NegativeSafeInt.clamp(-5)).toBe(-5);

      expect(NegativeSafeInt.clamp(0)).toBe(-1);

      expect(NegativeSafeInt.clamp(Number.MIN_SAFE_INTEGER - 100)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });
  });

  describe('NegativeSafeInt.add / sub', () => {
    test('adds and subtracts within the range', () => {
      expect(NegativeSafeInt.add(-5, -3)).toBe(-8);

      expect(NegativeSafeInt.sub(-10, -3)).toBe(-7);

      expect(NegativeSafeInt.sub(-3, -10)).toBe(-1);
    });
  });

  describe('NegativeSafeInt.random', () => {
    test('generates values within range', () => {
      for (const _ of range(100)) {
        const value = NegativeSafeInt.random();

        assert.isTrue(isNegativeSafeInt(value));
      }
    });
  });
});
