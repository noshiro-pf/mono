import { expectType } from '../expect-type.mjs';
import { pipe } from '../functional/index.mjs';
import { asNonZeroFiniteNumber } from './branded-types/index.mjs';
import { Num } from './num.mjs';

const testClamp = (
  [a, b]: readonly [number, number],
  target: number,
  expected: number,
): void => {
  test(`clamp ${target} to [${a}, ${b}]`, () => {
    expect(Num.clamp(a, b)(target)).toBe(expected);
  });
};

describe('Num test', () => {
  describe('clamp', () => {
    testClamp([0, 2], 2.3, 2);
    testClamp([0, 2], -0.5, 0);
    testClamp([0, 2], 1.5, 1.5);
    testClamp([0, 2], Number.NaN, 0);

    test('should support regular usage with three parameters', () => {
      expectTypeOf(Num.clamp(15, 0, 10)).toEqualTypeOf<number>();

      expect(Num.clamp(15, 0, 10)).toBe(10);
      expect(Num.clamp(-5, 0, 10)).toBe(0);
      expect(Num.clamp(5, 0, 10)).toBe(5);
      expect(Num.clamp(Number.NaN, 0, 10)).toBe(0);
    });

    test('should work with pipe when curried', () => {
      const clampTo0_10 = Num.clamp(0, 10);

      const result1 = pipe(15).map(clampTo0_10).value;

      expect(result1).toBe(10);

      const result2 = pipe(-5).map(clampTo0_10).value;

      expect(result2).toBe(0);

      const result3 = pipe(7.5).map(clampTo0_10).value;

      expect(result3).toBe(7.5);
    });

    test('should handle edge cases in curried form', () => {
      const clampTo5_15 = Num.clamp(5, 15);

      expectType<typeof clampTo5_15, (target: number) => number>('=');

      // Invalid (non-finite) values return the lower bound
      expect(clampTo5_15(Number.POSITIVE_INFINITY)).toBe(5);
      expect(clampTo5_15(Number.NEGATIVE_INFINITY)).toBe(5);
      expect(clampTo5_15(Number.NaN)).toBe(5);
    });

    test('should work with negative ranges', () => {
      expect(Num.clamp(-15, -10, -5)).toBe(-10);
      expect(Num.clamp(-7, -10, -5)).toBe(-7);
      expect(Num.clamp(0, -10, -5)).toBe(-5);

      const clampNegative = Num.clamp(-10, -5);

      expect(clampNegative(-15)).toBe(-10);
      expect(clampNegative(-7)).toBe(-7);
      expect(clampNegative(0)).toBe(-5);
    });
  });

  describe('isUintInRangeInclusive', () => {
    test('truthy case', () => {
      const f = Num.isUintInRangeInclusive(0, 4);
      const x: number = 2;
      if (f(x)) {
        expectType<typeof x, 0 | 1 | 2 | 3 | 4>('=');
      } else {
        expectType<typeof x, number>('=');
      }

      expect(f(x)).toBe(true);
    });

    test('falsy case', () => {
      const f = Num.isUintInRangeInclusive(0, 4);
      const x: number = 100;
      if (f(x)) {
        expectType<typeof x, 0 | 1 | 2 | 3 | 4>('=');
      } else {
        expectType<typeof x, number>('=');
      }

      expect(f(x)).toBe(false);
    });
  });

  describe('from', () => {
    test('converts string to number', () => {
      expect(Num.from('123')).toBe(123);
      expect(Num.from('123.45')).toBe(123.45);
      expect(Num.from('-42')).toBe(-42);
    });

    test('handles edge cases', () => {
      expect(Num.from('')).toBe(0);
      expect(Num.from('abc')).toBeNaN();
      expect(Num.from(true)).toBe(1);
      expect(Num.from(false)).toBe(0);
    });
  });

  describe('isInRange', () => {
    test('checks range (lower inclusive, upper exclusive)', () => {
      const inRange = Num.isInRange(0, 10);

      expect(inRange(5)).toBe(true);
      expect(inRange(0)).toBe(true); // inclusive lower bound
      expect(inRange(10)).toBe(false); // exclusive upper bound
      expect(inRange(-1)).toBe(false);
      expect(inRange(15)).toBe(false);
    });
  });

  describe('isInRangeInclusive', () => {
    test('checks range (inclusive)', () => {
      const inRange = Num.isInRangeInclusive(0, 10);

      expect(inRange(5)).toBe(true);
      expect(inRange(0)).toBe(true); // inclusive
      expect(inRange(10)).toBe(true); // inclusive
      expect(inRange(-1)).toBe(false);
      expect(inRange(15)).toBe(false);
    });
  });

  describe('isUintInRange', () => {
    test('checks uint range (lower inclusive, upper exclusive)', () => {
      const inRange = Num.isUintInRange(0, 5);

      expect(inRange(2)).toBe(true);
      expect(inRange(0)).toBe(true); // inclusive lower bound
      expect(inRange(5)).toBe(false); // exclusive upper bound
      expect(inRange(-1)).toBe(false);
    });
  });

  describe('isNonZero', () => {
    test('type guard for non-zero numbers', () => {
      const x: number = 5;
      if (Num.isNonZero(x)) {
        expectType<typeof x, NonZeroNumber>('=');
      }

      expect(Num.isNonZero(5)).toBe(true);
      expect(Num.isNonZero(-3)).toBe(true);
      expect(Num.isNonZero(0)).toBe(false);
    });
  });

  describe('isNonNegative', () => {
    test('type guard for non-negative numbers', () => {
      expect(Num.isNonNegative(5)).toBe(true);
      expect(Num.isNonNegative(0)).toBe(true);
      expect(Num.isNonNegative(-1)).toBe(false);
    });
  });

  describe('isPositive', () => {
    test('type guard for positive numbers', () => {
      expect(Num.isPositive(5)).toBe(true);
      expect(Num.isPositive(0.1)).toBe(true);
      expect(Num.isPositive(0)).toBe(false);
      expect(Num.isPositive(-1)).toBe(false);
    });
  });

  describe('div', () => {
    test('basic division', () => {
      expect(Num.div(10, 2)).toBe(5);
      expect(Num.div(7, 3)).toBe(7 / 3);
      expect(Num.div(-10, 2)).toBe(-5);
    });
  });

  describe('divInt', () => {
    test('integer division (floor)', () => {
      expect(Num.divInt(10, 3)).toBe(3);
      expect(Num.divInt(7, 2)).toBe(3);
      expect(Num.divInt(-7, 2)).toBe(-4); // floor division
      expect(Num.divInt(10.7, asNonZeroFiniteNumber(3.2))).toBe(3); // floors both operands
    });
  });

  describe('roundAt', () => {
    test('rounds to specified decimal places', () => {
      expect(Num.roundAt(3.141_59, 2)).toBe(3.14);
      expect(Num.roundAt(3.141_59, 3)).toBe(3.142);
      expect(Num.roundAt(2.555, 2)).toBe(2.56);
      expect(Num.roundAt(123.456, 1)).toBe(123.5);
    });
  });

  describe('roundToInt', () => {
    test('rounds to nearest integer', () => {
      expect(Num.roundToInt(3.4)).toBe(3);
      expect(Num.roundToInt(3.6)).toBe(4);
      expect(Num.roundToInt(2.5)).toBe(3);
      expect(Num.roundToInt(-2.3)).toBe(-1); // bitwise behavior: -2.3 + 0.5 = -1.8, then floor with bitwise OR
      expect(Num.roundToInt(-2.7)).toBe(-2); // bitwise behavior: -2.7 + 0.5 = -2.2, then floor with bitwise OR
    });
  });

  describe('round', () => {
    test('creates rounding function with specified precision', () => {
      const round2 = Num.round(2);

      expect(round2(3.141_59)).toBe(3.14);
      expect(round2(2.556)).toBe(2.56);

      const round1 = Num.round(1);

      expect(round1(3.141_59)).toBe(3.1);
      expect(round1(2.56)).toBe(2.6);

      const round3 = Num.round(3);

      expect(round3(3.1416)).toBe(3.142);
      expect(round3(2.7182)).toBe(2.718);
    });
  });

  describe('mapNaN2Undefined', () => {
    test('maps NaN to undefined', () => {
      expect(Num.mapNaN2Undefined(5)).toBe(5);
      expect(Num.mapNaN2Undefined(0)).toBe(0);
      expect(Num.mapNaN2Undefined(-3.14)).toBe(-3.14);
      expect(Num.mapNaN2Undefined(Number.NaN)).toBeUndefined();
    });
  });

  describe('increment', () => {
    test('increments SmallUint values', () => {
      expect(Num.increment(0)).toBe(1);
      expect(Num.increment(5)).toBe(6);
      expect(Num.increment(38)).toBe(39);
    });
  });

  describe('decrement', () => {
    test('decrements PositiveSmallInt values', () => {
      expect(Num.decrement(1)).toBe(0);
      expect(Num.decrement(5)).toBe(4);
      expect(Num.decrement(39)).toBe(38);
    });
  });
});
