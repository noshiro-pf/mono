import { clampAndRoundFn } from './clamp-and-round.mjs';

describe(clampAndRoundFn, () => {
  const clamp = clampAndRoundFn({ min: 0, max: 10, digit: 1, defaultValue: 5 });

  test('clamps to the bounds, rounds to the digits, and replaces what is not finite', () => {
    assert.deepStrictEqual(
      [-1, 11, 1.26, 3.04, Number.NaN, Number.POSITIVE_INFINITY].map(clamp),
      [0, 10, 1.3, 3, 5, 5],
    );
  });

  test('leaves a number as it is where rounding to the digits overflows', () => {
    const fine = clampAndRoundFn({
      min: 0,
      max: Number.POSITIVE_INFINITY,
      digit: 400,
      defaultValue: 0,
    });

    const wide = clampAndRoundFn({
      min: 0,
      max: Number.POSITIVE_INFINITY,
      digit: 300,
      defaultValue: 0,
    });

    assert.deepStrictEqual([fine(1.234), wide(1e10)], [1.234, 1e10]);
  });
});
