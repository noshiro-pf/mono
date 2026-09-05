import { type FixedLengthTuple } from 'ts-type-forge';
import { isValidRect } from './is-valid-rect.mjs';

const testIsValidRect = (
  [top_, left, width, height]: FixedLengthTuple<4, number>,
  expected: boolean,
): void => {
  test(`isValidRect(Rect({ top: ${top_}, left: ${left}, width: ${width}, height: ${height} }))`, () => {
    expect(isValidRect({ top: top_, left, width, height })).toBe(expected);
  });
};

testIsValidRect([0, 0, 1, 1], true);

testIsValidRect([0, 0, -1, 1], false);

testIsValidRect([0, 0, 1, -1], false);

testIsValidRect([0, 0, -1, -1], false);

testIsValidRect([0, 0, 0, 1], false);

testIsValidRect([0, 0, 1, 0], false);

testIsValidRect([0, 0, 0, 0], false);
