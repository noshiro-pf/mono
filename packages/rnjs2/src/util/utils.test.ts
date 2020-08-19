import { binarySearch, halfInt } from './utils';

describe('halfInt', () => {
  test('case: even number', () => {
    expect(halfInt(2)).toBe(1);
  });

  test('case: odd positive number', () => {
    expect(halfInt(3)).toBe(1);
  });

  test('case: odd negative number', () => {
    expect(halfInt(-3)).toBe(-1);
  });

  test('case: float positive number', () => {
    expect(halfInt(3.3)).toBe(1);
  });

  test('case: float negative number', () => {
    expect(halfInt(-3.3)).toBe(-1);
  });
});

describe('binarySearch', () => {
  test('empty array', () => {
    expect(binarySearch([], 0)).toBe(0);
  });

  test('1 element array (1)', () => {
    expect(binarySearch([1], 0)).toBe(0);
  });

  test('1 element array (2)', () => {
    expect(binarySearch([-1], 0)).toBe(1);
  });

  test('2 element array (1)', () => {
    expect(binarySearch([-1, 1], 0)).toBe(1);
  });

  test('2 element array (2)', () => {
    expect(binarySearch([1, 2], 0)).toBe(0);
  });

  test('2 element array (3)', () => {
    expect(binarySearch([-2, -1], 0)).toBe(2);
  });

  test('array with same value (1)', () => {
    expect([0, 1].includes(binarySearch([0], 0))).toBeTruthy();
  });

  test('array with same value (2)', () => {
    expect([0, 1, 2].includes(binarySearch([0, 0], 0))).toBeTruthy();
  });

  test('array with same value (3)', () => {
    expect([0, 1, 2, 3].includes(binarySearch([0, 0, 0], 0))).toBeTruthy();
  });

  test('complicated example', () => {
    expect([2, 3].includes(binarySearch([1, 3, 4, 6, 7, 8], 4))).toBeTruthy();
  });

  test('complicated example', () => {
    expect(
      [2, 3, 4].includes(binarySearch([1, 3, 4, 4, 6, 7, 8], 4))
    ).toBeTruthy();
  });

  test('complicated example', () => {
    expect(binarySearch([1, 3, 4, 4, 6, 7, 8], 0)).toBe(0);
  });

  test('complicated example', () => {
    expect(
      [0, 1].includes(binarySearch([1, 3, 4, 4, 6, 7, 8], 1))
    ).toBeTruthy();
  });

  test('complicated example', () => {
    expect(
      [0, 1, 2, 3].includes(binarySearch([1, 1, 1, 3, 4, 4, 6, 7, 8], 1))
    ).toBeTruthy();
  });

  test('complicated example', () => {
    expect(
      [5, 6].includes(binarySearch([1, 3, 4, 4, 6, 7, 8], 7))
    ).toBeTruthy();
  });

  test('complicated example', () => {
    expect(
      [6, 7].includes(binarySearch([1, 3, 4, 4, 6, 7, 8], 8))
    ).toBeTruthy();
  });

  test('complicated example', () => {
    expect(binarySearch([1, 3, 4, 4, 6, 7, 8], 9)).toBe(7);
  });
});
