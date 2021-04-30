import { clamp } from './clamp';

const testClamp = (
  [a, b]: readonly [number, number],
  target: number,
  expected: number
): void => {
  test(`clamp ${target} to [${a}, ${b}]`, () => {
    expect(clamp(a, b)(target)).toBe(expected);
  });
};

testClamp([0, 2], 2.3, 2);
testClamp([0, 2], -0.5, 0);
testClamp([0, 2], 1.5, 1.5);
testClamp([0, 2], NaN, 0);
