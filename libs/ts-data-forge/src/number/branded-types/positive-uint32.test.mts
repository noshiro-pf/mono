import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import {
  asPositiveUint32,
  isPositiveUint32,
  PositiveUint32,
} from './positive-uint32.mjs';

describe('PositiveUint32 test', () => {
  describe(asPositiveUint32, () => {
    test('accepts valid positive uint32 values', () => {
      expect(() => asPositiveUint32(1)).not.toThrow();

      expect(() => asPositiveUint32(1000)).not.toThrow();

      expect(() => asPositiveUint32(4_294_967_295)).not.toThrow(); // 2^32 - 1

      expect(() => asPositiveUint32(2_147_483_648)).not.toThrow(); // 2^31
    });

    test('rejects zero', () => {
      expect(() => asPositiveUint32(0)).toThrow(TypeError);
    });

    test('rejects values outside uint32 range', () => {
      expect(() => asPositiveUint32(4_294_967_296)).toThrow(TypeError); // 2^32

      expect(() => asPositiveUint32(10_000_000_000)).toThrow(TypeError);
    });

    test('rejects negative integers', () => {
      expect(() => asPositiveUint32(-1)).toThrow(TypeError);

      expect(() => asPositiveUint32(-42)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asPositiveUint32(Number.NaN)).toThrow(TypeError);

      expect(() => asPositiveUint32(Number.POSITIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asPositiveUint32(Number.NEGATIVE_INFINITY)).toThrow(
        TypeError,
      );

      expect(() => asPositiveUint32(1.2)).toThrow(TypeError);

      expect(() => asPositiveUint32(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asPositiveUint32(5)).toBe(5);

      expect(asPositiveUint32(1)).toBe(1);

      expect(asPositiveUint32(4_294_967_295)).toBe(4_294_967_295);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
      { name: '-1', value: -1 },
      { name: '4294967296', value: 4_294_967_296 },
    ] as const)(
      `asPositiveUint32($name) should throw a TypeError`,
      ({ value }) => {
        expect(() => asPositiveUint32(value)).toThrow(
          new TypeError(
            `Expected a positive integer in [1, 2^32), got: ${value}`,
          ),
        );
      },
    );
  });

  describe(isPositiveUint32, () => {
    test('correctly identifies positive uint32 values', () => {
      expect(isPositiveUint32(1)).toBe(true);

      expect(isPositiveUint32(1000)).toBe(true);

      expect(isPositiveUint32(4_294_967_295)).toBe(true);

      expect(isPositiveUint32(2_147_483_648)).toBe(true);
    });

    test('correctly identifies zero', () => {
      expect(isPositiveUint32(0)).toBe(false);
    });

    test('correctly identifies values outside uint32 range', () => {
      expect(isPositiveUint32(4_294_967_296)).toBe(false);

      expect(isPositiveUint32(10_000_000_000)).toBe(false);
    });

    test('correctly identifies negative integers', () => {
      expect(isPositiveUint32(-1)).toBe(false);

      expect(isPositiveUint32(-42)).toBe(false);
    });

    test('correctly identifies non-integers', () => {
      expect(isPositiveUint32(Number.NaN)).toBe(false);

      expect(isPositiveUint32(Number.POSITIVE_INFINITY)).toBe(false);

      expect(isPositiveUint32(Number.NEGATIVE_INFINITY)).toBe(false);

      expect(isPositiveUint32(1.2)).toBe(false);

      expect(isPositiveUint32(-3.4)).toBe(false);
    });
  });

  describe('PositiveUint32.is', () => {
    test('same as isPositiveUint32 function', () => {
      expect(PositiveUint32.is(5)).toBe(isPositiveUint32(5));

      expect(PositiveUint32.is(0)).toBe(isPositiveUint32(0));

      expect(PositiveUint32.is(-1)).toBe(isPositiveUint32(-1));
    });
  });

  describe('constants', () => {
    test('MIN_VALUE and MAX_VALUE', () => {
      expect(PositiveUint32.MIN_VALUE).toBe(1);

      expect(PositiveUint32.MAX_VALUE).toBe(4_294_967_295);
    });
  });

  describe('mathematical operations', () => {
    const a = asPositiveUint32(1_000_000);

    const b = asPositiveUint32(500_000);

    test('min and max', () => {
      expect(PositiveUint32.min(a, b)).toBe(500_000);

      expect(PositiveUint32.max(a, b)).toBe(1_000_000);
    });

    test('add (with clamping to positive uint32 range)', () => {
      const result = PositiveUint32.add(
        asPositiveUint32(4_294_967_000),
        asPositiveUint32(1000),
      );

      expect(result).toBe(4_294_967_295); // clamped to max

      expect(PositiveUint32.add(a, b)).toBe(1_500_000);
    });

    test('sub (never goes below 1)', () => {
      expect(PositiveUint32.sub(a, b)).toBe(500_000);

      expect(PositiveUint32.sub(b, a)).toBe(1); // clamped to 1
    });

    test('mul (with clamping to positive uint32 range)', () => {
      const result = PositiveUint32.mul(
        asPositiveUint32(100_000),
        asPositiveUint32(100_000),
      );

      expect(result).toBe(4_294_967_295); // clamped to max

      expect(
        PositiveUint32.mul(asPositiveUint32(1000), asPositiveUint32(5)),
      ).toBe(5000);
    });

    test('div (floor division, never goes below 1)', () => {
      expect(PositiveUint32.div(a, asPositiveUint32(500_000))).toBe(2);

      expect(PositiveUint32.div(asPositiveUint32(7), asPositiveUint32(3))).toBe(
        2,
      );

      expect(
        PositiveUint32.div(
          asPositiveUint32(500_000),
          asPositiveUint32(1_000_000),
        ),
      ).toBe(1); // floor(500000/1000000) = 0, clamped to 1
    });

    test('pow (with clamping to positive uint32 range)', () => {
      const result = PositiveUint32.pow(
        asPositiveUint32(10_000),
        asPositiveUint32(3),
      );

      expect(result).toBe(4_294_967_295); // clamped to max

      expect(PositiveUint32.pow(asPositiveUint32(2), asPositiveUint32(3))).toBe(
        8,
      );
    });
  });

  describe('random', () => {
    test('generates positive uint32 values within specified range', () => {
      const min = 1;

      const max = 20;

      for (const _ of range(10)) {
        const result = PositiveUint32.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        expect(PositiveUint32.is(result)).toBe(true);

        expect(Number.isInteger(result)).toBe(true);

        expect(result).toBeGreaterThan(0);
      }
    });

    test('generates values within PositiveUint32 range', () => {
      for (const _ of range(10)) {
        const result = PositiveUint32.random(1, 30);

        expect(result).toBeGreaterThanOrEqual(1);

        expect(result).toBeLessThanOrEqual(4_294_967_295);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<PositiveUint32, number>('<=');

      expectTypeOf(asPositiveUint32(1_000_000)).toExtend<PositiveUint32>();
    });
  });
});
