/* eslint-disable
  @typescript-eslint/ban-ts-comment,
  @typescript-eslint/no-explicit-any,
*/

import { range } from './range';

describe('range', () => {
  test('range(0, 10)', () => {
    expect(Array.from(range(0, 10))).toStrictEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  test('range(10, 0, -1)', () => {
    expect(Array.from(range(10, 0, -1))).toStrictEqual([
      10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ]);
  });

  test('range(0, -10, -1)', () => {
    expect(Array.from(range(0, -10, -1))).toStrictEqual([
      0, -1, -2, -3, -4, -5, -6, -7, -8, -9,
    ]);
  });

  test('range(0, 0)', () => {
    expect(Array.from(range(0, 0))).toStrictEqual([]);
  });

  test('range(0, 11, 2)', () => {
    expect(Array.from(range(0, 11, 2))).toStrictEqual([0, 2, 4, 6, 8, 10]);
  });

  test('range(1, 12, 2)', () => {
    expect(Array.from(range(1, 12, 2))).toStrictEqual([1, 3, 5, 7, 9, 11]);
  });
});
