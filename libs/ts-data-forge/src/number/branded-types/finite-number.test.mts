import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asFiniteNumber, FiniteNumber } from './finite-number.mjs';
import { asNonZeroFiniteNumber } from './non-zero-finite-number.mjs';

describe('FiniteNumber test', () => {
  describe(asFiniteNumber, () => {
    test('accepts valid finite numbers', () => {
      expect(() => asFiniteNumber(0)).not.toThrow();
      expect(() => asFiniteNumber(1)).not.toThrow();
      expect(() => asFiniteNumber(-1)).not.toThrow();
      expect(() => asFiniteNumber(3.14)).not.toThrow();
      expect(() => asFiniteNumber(-2.5)).not.toThrow();
      expect(() => asFiniteNumber(Number.MAX_VALUE)).not.toThrow();
      expect(() => asFiniteNumber(-Number.MAX_VALUE)).not.toThrow();
    });

    test('rejects non-finite numbers', () => {
      expect(() => asFiniteNumber(Number.NaN)).toThrow(TypeError);
      expect(() => asFiniteNumber(Number.POSITIVE_INFINITY)).toThrow(TypeError);
      expect(() => asFiniteNumber(Number.NEGATIVE_INFINITY)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asFiniteNumber(5.5)).toBe(5.5);
      expect(asFiniteNumber(-10)).toBe(-10);
      expect(asFiniteNumber(0)).toBe(0);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    ] as const)(
      `asFiniteNumber($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asFiniteNumber(value)).toThrow(
          new TypeError(`Expected a finite number, got: ${value}`),
        );
      },
    );
  });

  describe('FiniteNumber.is', () => {
    test('correctly identifies finite numbers', () => {
      expect(FiniteNumber.is(0)).toBe(true);
      expect(FiniteNumber.is(1)).toBe(true);
      expect(FiniteNumber.is(-1)).toBe(true);
      expect(FiniteNumber.is(3.14)).toBe(true);
      expect(FiniteNumber.is(-2.5)).toBe(true);
      expect(FiniteNumber.is(Number.MAX_VALUE)).toBe(true);
      expect(FiniteNumber.is(-Number.MAX_VALUE)).toBe(true);
    });

    test('correctly identifies non-finite numbers', () => {
      expect(FiniteNumber.is(Number.NaN)).toBe(false);
      expect(FiniteNumber.is(Number.POSITIVE_INFINITY)).toBe(false);
      expect(FiniteNumber.is(Number.NEGATIVE_INFINITY)).toBe(false);
    });
  });

  describe('mathematical operations', () => {
    const a = asFiniteNumber(5.5);
    const b = asFiniteNumber(2.5);
    const c = asFiniteNumber(-3.5);

    test('abs', () => {
      expect(FiniteNumber.abs(a)).toBe(5.5);
      expect(FiniteNumber.abs(c)).toBe(3.5);
      expect(FiniteNumber.abs(asFiniteNumber(0))).toBe(0);
    });

    test('min and max', () => {
      expect(FiniteNumber.min(a, b)).toBe(2.5);
      expect(FiniteNumber.max(a, b)).toBe(5.5);
      expect(FiniteNumber.min(a, c)).toBe(-3.5);
      expect(FiniteNumber.max(a, c)).toBe(5.5);
    });

    test('floor, ceil, round', () => {
      expect(FiniteNumber.floor(a)).toBe(5);
      expect(FiniteNumber.ceil(a)).toBe(6);
      expect(FiniteNumber.round(a)).toBe(6);
      expect(FiniteNumber.floor(c)).toBe(-4);
      expect(FiniteNumber.ceil(c)).toBe(-3);
      expect(FiniteNumber.round(c)).toBe(-3);
    });

    test('add', () => {
      expect(FiniteNumber.add(a, b)).toBe(8);
      expect(FiniteNumber.add(a, c)).toBe(2);
    });

    test('sub', () => {
      expect(FiniteNumber.sub(a, b)).toBe(3);
      expect(FiniteNumber.sub(a, c)).toBe(9);
    });

    test('mul', () => {
      expect(FiniteNumber.mul(a, b)).toBe(13.75);
      expect(FiniteNumber.mul(a, c)).toBe(-19.25);
    });

    test('div', () => {
      expect(FiniteNumber.div(a, asNonZeroFiniteNumber(2.5))).toBe(2.2);
      expect(FiniteNumber.div(a, asNonZeroFiniteNumber(2))).toBe(2.75);
    });

    test('pow', () => {
      expect(FiniteNumber.pow(asFiniteNumber(2), asFiniteNumber(3))).toBe(8);
      expect(FiniteNumber.pow(asFiniteNumber(3), asFiniteNumber(2))).toBe(9);
    });
  });

  describe('random', () => {
    test('generates numbers within specified range', () => {
      const min = asFiniteNumber(-5.5);
      const max = asFiniteNumber(10.3);

      for (const _ of range(10)) {
        const result = FiniteNumber.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(FiniteNumber.is(result)).toBe(true);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<FiniteNumber, number>('<=');

      expectTypeOf(asFiniteNumber(5.5)).toExtend<FiniteNumber>();
    });
  });
});
