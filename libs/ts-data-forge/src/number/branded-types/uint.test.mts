import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asUint, isUint, Uint } from './uint.mjs';

describe('Uint test', () => {
  describe(asUint, () => {
    test('accepts valid unsigned integers', () => {
      expect(() => asUint(0)).not.toThrow();

      expect(() => asUint(1)).not.toThrow();

      expect(() => asUint(42)).not.toThrow();

      expect(() => asUint(100)).not.toThrow();

      expect(() => asUint(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects negative integers', () => {
      expect(() => asUint(-1)).toThrow(TypeError);

      expect(() => asUint(-42)).toThrow(TypeError);

      expect(() => asUint(Number.MIN_SAFE_INTEGER)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asUint(Number.NaN)).toThrow(TypeError);

      expect(() => asUint(Number.POSITIVE_INFINITY)).toThrow(TypeError);

      expect(() => asUint(Number.NEGATIVE_INFINITY)).toThrow(TypeError);

      expect(() => asUint(1.2)).toThrow(TypeError);

      expect(() => asUint(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asUint(5)).toBe(5);

      expect(asUint(0)).toBe(0);

      expect(asUint(10)).toBe(10);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '-1', value: -1 },
    ] as const)(`asUint($name) should throw a TypeError`, ({ value }) => {
      expect(() => asUint(value)).toThrow(
        new TypeError(`Expected a non-negative integer, got: ${value}`),
      );
    });
  });

  describe(isUint, () => {
    test('correctly identifies unsigned integers', () => {
      expect(isUint(0)).toBe(true);

      expect(isUint(1)).toBe(true);

      expect(isUint(42)).toBe(true);

      expect(isUint(100)).toBe(true);

      expect(isUint(Number.MAX_SAFE_INTEGER)).toBe(true);
    });

    test('correctly identifies negative integers', () => {
      expect(isUint(-1)).toBe(false);

      expect(isUint(-42)).toBe(false);

      expect(isUint(Number.MIN_SAFE_INTEGER)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isUint(Number.NaN)).toBe(false);

      expect(isUint(Number.POSITIVE_INFINITY)).toBe(false);

      expect(isUint(Number.NEGATIVE_INFINITY)).toBe(false);

      expect(isUint(1.2)).toBe(false);

      expect(isUint(-3.4)).toBe(false);
    });
  });

  describe('Uint.is', () => {
    test('same as isUint function', () => {
      expect(Uint.is(5)).toBe(isUint(5));

      expect(Uint.is(-1)).toBe(isUint(-1));

      expect(Uint.is(0)).toBe(isUint(0));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE', () => {
      expect(Uint.MIN_VALUE).toBe(0);
    });
  });

  describe('mathematical operations', () => {
    const a = asUint(5);

    const b = asUint(2);

    const c = asUint(0);

    test('min and max', () => {
      expect(Uint.min(a, b)).toBe(2);

      expect(Uint.max(a, b)).toBe(5);

      expect(Uint.min(a, c)).toBe(0);

      expect(Uint.max(a, c)).toBe(5);
    });

    test('add (never goes below 0)', () => {
      expect(Uint.add(a, b)).toBe(7);

      expect(Uint.add(a, c)).toBe(5);
    });

    test('sub (never goes below 0)', () => {
      expect(Uint.sub(a, b)).toBe(3);

      expect(Uint.sub(b, a)).toBe(0); // clamped to 0

      expect(Uint.sub(c, a)).toBe(0); // clamped to 0
    });

    test('mul (never goes below 0)', () => {
      expect(Uint.mul(a, b)).toBe(10);

      expect(Uint.mul(a, c)).toBe(0);
    });

    test('div (floor division, never goes below 0)', () => {
      expect(Uint.div(a, b)).toBe(2);

      expect(Uint.div(asUint(7), asUint(3))).toBe(2);

      expect(Uint.div(b, a)).toBe(0); // floor(2/5) = 0
    });

    test('pow (never goes below 0)', () => {
      expect(Uint.pow(asUint(2), asUint(3))).toBe(8);

      expect(Uint.pow(asUint(3), asUint(2))).toBe(9);

      expect(Uint.pow(asUint(5), asUint(0))).toBe(1);
    });
  });

  describe('random', () => {
    test('generates unsigned integers within specified range', () => {
      const min = 0;

      const max = 20;

      for (const _ of range(10)) {
        const result = Uint.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        expect(Uint.is(result)).toBe(true);

        expect(Number.isInteger(result)).toBe(true);

        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    test('generates values starting from 0', () => {
      for (const _ of range(10)) {
        const result = Uint.random(0, 30);

        expect(result).toBeGreaterThanOrEqual(0);

        expect(result).toBeLessThanOrEqual(30);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<Uint, number>('<=');

      expectTypeOf(asUint(5)).toExtend<Uint>();
    });
  });
});
