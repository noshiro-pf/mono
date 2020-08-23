import { isValidRect } from './is-valid-rect';

const testIsValidRect = (
  [top, left, width, height]: [number, number, number, number],
  expected: boolean
): void => {
  test(`isValidRect(Rect({ top: ${top}, left: ${left}, width: ${width}, height: ${height} }))`, () => {
    expect(isValidRect({ top, left, width, height })).toBe(expected);
  });
};

testIsValidRect([0, 0, 1, 1], true);
testIsValidRect([0, 0, -1, 1], false);
testIsValidRect([0, 0, 1, -1], false);
testIsValidRect([0, 0, -1, -1], false);
testIsValidRect([0, 0, 0, 1], false);
testIsValidRect([0, 0, 1, 0], false);
testIsValidRect([0, 0, 0, 0], false);
