import {
  type NegativeInt,
  type NonPositiveInt,
  type PositiveFiniteNumber,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asNegativeFiniteNumber,
  isNegativeFiniteNumber,
  NegativeFiniteNumber,
} from './negative-finite-number.mjs';

describe('NegativeFiniteNumber test', () => {
  describe(asNegativeFiniteNumber, () => {
    test('accepts valid negative finite numbers', () => {
      expect(() => asNegativeFiniteNumber(-1)).not.toThrow();

      expect(() => asNegativeFiniteNumber(-1.5)).not.toThrow();

      expect(() => asNegativeFiniteNumber(-1e308)).not.toThrow();
    });

    test('rejects zero and positive numbers', () => {
      expect(() => asNegativeFiniteNumber(0)).toThrow(TypeError);

      expect(() => asNegativeFiniteNumber(1.5)).toThrow(TypeError);
    });

    test('rejects non-finite values', () => {
      expect(() => asNegativeFiniteNumber(Number.NaN)).toThrow(TypeError);

      expect(() => asNegativeFiniteNumber(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );
    });
  });

  describe(isNegativeFiniteNumber, () => {
    test('correctly identifies negative finite numbers', () => {
      assert.isTrue(isNegativeFiniteNumber(-1));

      assert.isTrue(isNegativeFiniteNumber(-1.5));

      assert.isFalse(isNegativeFiniteNumber(0));

      assert.isFalse(isNegativeFiniteNumber(1));

      assert.isFalse(isNegativeFiniteNumber(Number.NEGATIVE_INFINITY));
    });
  });

  describe('NegativeFiniteNumber.is', () => {
    test('works as a type guard', () => {
      const value: number = -42.5;

      if (NegativeFiniteNumber.is(value)) {
        expectType<typeof value, typeof value & NegativeFiniteNumber>('=');
      }
    });
  });

  describe('NegativeFiniteNumber.abs', () => {
    test('returns the absolute value as a positive finite number', () => {
      expect(
        NegativeFiniteNumber.abs(asNegativeFiniteNumber(-5.5)),
      ).toBeCloseTo(5.5, 5);
    });

    test('result type is PositiveFiniteNumber', () => {
      expectType<
        ReturnType<typeof NegativeFiniteNumber.abs>,
        PositiveFiniteNumber
      >('=');
    });
  });

  describe('NegativeFiniteNumber.min / max', () => {
    test('returns the expected extremum', () => {
      expect(
        NegativeFiniteNumber.min(
          asNegativeFiniteNumber(-5.5),
          asNegativeFiniteNumber(-10.5),
        ),
      ).toBeCloseTo(-10.5, 5);

      expect(
        NegativeFiniteNumber.max(
          asNegativeFiniteNumber(-5.5),
          asNegativeFiniteNumber(-10.5),
        ),
      ).toBeCloseTo(-5.5, 5);
    });
  });

  describe('NegativeFiniteNumber.clamp', () => {
    test('clamps non-negative values into range', () => {
      expect(NegativeFiniteNumber.clamp(-5.5)).toBeCloseTo(-5.5, 5);

      expect(NegativeFiniteNumber.clamp(0)).toBeLessThan(0);

      expect(NegativeFiniteNumber.clamp(5)).toBeLessThan(0);
    });
  });

  describe('NegativeFiniteNumber.floor / ceil / round', () => {
    test('rounds toward integers', () => {
      expect(NegativeFiniteNumber.floor(asNegativeFiniteNumber(-2.3))).toBe(-3);

      expect(NegativeFiniteNumber.ceil(asNegativeFiniteNumber(-2.3))).toBe(-2);

      expect(
        NegativeFiniteNumber.ceil(asNegativeFiniteNumber(-0.5)),
      ).toBeCloseTo(0);

      expect(
        NegativeFiniteNumber.round(asNegativeFiniteNumber(-0.4)),
      ).toBeCloseTo(0);
    });

    test('floor result type is NegativeInt', () => {
      expectType<ReturnType<typeof NegativeFiniteNumber.floor>, NegativeInt>(
        '=',
      );
    });

    test('ceil/round result type is NonPositiveInt', () => {
      expectType<ReturnType<typeof NegativeFiniteNumber.ceil>, NonPositiveInt>(
        '=',
      );

      expectType<ReturnType<typeof NegativeFiniteNumber.round>, NonPositiveInt>(
        '=',
      );
    });
  });

  describe('NegativeFiniteNumber.add / sub', () => {
    test('adds and subtracts within range', () => {
      expect(
        NegativeFiniteNumber.add(
          asNegativeFiniteNumber(-5.5),
          asNegativeFiniteNumber(-3.5),
        ),
      ).toBeCloseTo(-9, 5);

      expect(
        NegativeFiniteNumber.sub(
          asNegativeFiniteNumber(-10.5),
          asNegativeFiniteNumber(-3.5),
        ),
      ).toBeCloseTo(-7, 5);

      expect(
        NegativeFiniteNumber.sub(
          asNegativeFiniteNumber(-3.5),
          asNegativeFiniteNumber(-10.5),
        ),
      ).toBeLessThan(0);
    });
  });

  describe('NegativeFiniteNumber.random', () => {
    test('generates values within range', () => {
      for (const _ of range(100)) {
        const value = NegativeFiniteNumber.random();

        assert.isTrue(isNegativeFiniteNumber(value));
      }
    });
  });
});
