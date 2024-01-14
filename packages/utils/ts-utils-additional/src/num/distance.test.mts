import { dist } from './distance.mjs';

const testDist = (
  [a, b]: readonly [number, number],
  expected: number,
): void => {
  test(`testDist(dist(${a}, ${b}))`, () => {
    expect(dist(a, b)).toBe(expected);
  });
};

testDist([-1, 1], 2);
testDist([0, 2], 2);
testDist([1, -1], 2);
testDist([2, 0], 2);
