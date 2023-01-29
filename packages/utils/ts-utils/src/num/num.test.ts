import { expectType } from '../expect-type';
import { Num } from './num';

const testClamp = (
  [a, b]: readonly [number, number],
  target: number,
  expected: number
): void => {
  test(`clamp ${target} to [${a}, ${b}]`, () => {
    expect(Num.clamp(a, b)(target)).toBe(expected);
  });
};

describe('Num', () => {
  describe('clamp', () => {
    testClamp([0, 2], 2.3, 2);
    testClamp([0, 2], -0.5, 0);
    testClamp([0, 2], 1.5, 1.5);
    testClamp([0, 2], Num.NaN, 0);
  });

  describe('sign', () => {
    test('case 1', () => {
      expect(Num.sign(-2)).toBe(-1);
    });

    test('case 2', () => {
      expect(Num.sign(0)).toBe(0);
    });

    test('case 3', () => {
      expect(Num.sign(2)).toBe(1);
    });
  });

  describe('isUintInRange', () => {
    test('truthy case', () => {
      const f = Num.isUintInRange(0, 3);
      const x: number = 2;
      if (f(x)) {
        expectType<typeof x, 0 | 1 | 2 | 3>('=');
      } else {
        expectType<typeof x, number>('=');
      }
      expect(f(x)).toBe(true);
    });

    test('falsy case', () => {
      const f = Num.isUintInRange(0, 3);
      const x: number = 100;
      if (f(x)) {
        expectType<typeof x, 0 | 1 | 2 | 3>('=');
      } else {
        expectType<typeof x, number>('=');
      }
      expect(f(x)).toBe(false);
    });
  });
});
