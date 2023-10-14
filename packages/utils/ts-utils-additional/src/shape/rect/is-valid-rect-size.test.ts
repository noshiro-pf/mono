import { isValidRectSize } from './is-valid-rect-size';

const testIsValidRectSize = (
  [width, height]: readonly [number, number],
  expected: boolean,
): void => {
  test(`isValidRect(RectSize({width: ${width}, height: ${height} }))`, () => {
    expect(isValidRectSize({ width, height })).toBe(expected);
  });
};

testIsValidRectSize([1, 1], true);
testIsValidRectSize([-1, 1], false);
testIsValidRectSize([1, -1], false);
testIsValidRectSize([-1, -1], false);
testIsValidRectSize([0, 1], false);
testIsValidRectSize([1, 0], false);
testIsValidRectSize([0, 0], false);
