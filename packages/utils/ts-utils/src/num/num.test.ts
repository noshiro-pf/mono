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
});
