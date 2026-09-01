import { type FixedLengthTuple } from 'ts-type-forge';
import { normalizeRect } from './normalize-rect.mjs';

const testNormalizeRect = (
  before: FixedLengthTuple<4, number>,
  after: FixedLengthTuple<4, number>,
): void => {
  test(`normalizeRect({ top: ${before[0]}, left: ${before[1]}, width: ${before[2]}, height: ${before[3]} }))`, () => {
    assert.deepStrictEqual(
      normalizeRect({
        top: before[0],
        left: before[1],
        width: before[2],
        height: before[3],
      }),
      {
        top: after[0],
        left: after[1],
        width: after[2],
        height: after[3],
      },
    );
  });
};

testNormalizeRect([100, 100, 10, -10], [90, 100, 10, 10]);

testNormalizeRect([100, 100, -10, 10], [100, 90, 10, 10]);

testNormalizeRect([100, 100, -10, -10], [90, 90, 10, 10]);
