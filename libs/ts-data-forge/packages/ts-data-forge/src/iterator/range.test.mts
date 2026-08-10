import { range } from './range.mjs';

describe(range, () => {
  test('range(0, 10)', () => {
    assert.deepStrictEqual(
      Array.from(range(0, 10)),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  test('range(10)', () => {
    assert.deepStrictEqual(
      Array.from(range(10)),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  });

  test('range(0)', () => {
    assert.deepStrictEqual(Array.from(range(0)), []);
  });

  test('range(-1)', () => {
    // @ts-expect-error negative end is not allowed
    assert.deepStrictEqual(Array.from(range(-1)), []);
  });

  test('range(10, 0, -1)', () => {
    assert.deepStrictEqual(
      Array.from(range(10, 0, -1)),
      [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    );
  });

  test('range(0, -10, -1)', () => {
    assert.deepStrictEqual(
      Array.from(range(0, -10, -1)),
      [0, -1, -2, -3, -4, -5, -6, -7, -8, -9],
    );
  });

  test('range(0, 0)', () => {
    assert.deepStrictEqual(Array.from(range(0, 0)), []);
  });

  test('range(0, 11, 2)', () => {
    assert.deepStrictEqual(Array.from(range(0, 11, 2)), [0, 2, 4, 6, 8, 10]);
  });

  test('range(1, 12, 2)', () => {
    assert.deepStrictEqual(Array.from(range(1, 12, 2)), [1, 3, 5, 7, 9, 11]);
  });
});
