import { toSafeInt } from '@noshiro/ts-utils';
import { describe, expect, test } from 'vitest';
import { binarySearch, halfInt } from './utils.mjs';

describe('halfInt', () => {
  test('case: even number', () => {
    expect(halfInt(toSafeInt(2))).toBe(1);
  });

  test('case: odd positive number', () => {
    expect(halfInt(toSafeInt(3))).toBe(1);
  });

  test('case: odd negative number', () => {
    expect(halfInt(toSafeInt(-3))).toBe(-1);
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
    expect([0, 1]).toContain(binarySearch([0], 0));
  });

  test('array with same value (2)', () => {
    expect([0, 1, 2]).toContain(binarySearch([0, 0], 0));
  });

  test('array with same value (3)', () => {
    expect([0, 1, 2, 3]).toContain(binarySearch([0, 0, 0], 0));
  });

  test('complicated example 1', () => {
    expect([2, 3]).toContain(binarySearch([1, 3, 4, 6, 7, 8], 4));
  });

  test('complicated example 2', () => {
    expect([2, 3, 4]).toContain(binarySearch([1, 3, 4, 4, 6, 7, 8], 4));
  });

  test('complicated example 3', () => {
    expect(binarySearch([1, 3, 4, 4, 6, 7, 8], 0)).toBe(0);
  });

  test('complicated example 4', () => {
    expect([0, 1]).toContain(binarySearch([1, 3, 4, 4, 6, 7, 8], 1));
  });

  test('complicated example 5', () => {
    expect([0, 1, 2, 3]).toContain(
      binarySearch([1, 1, 1, 3, 4, 4, 6, 7, 8], 1),
    );
  });

  test('complicated example 6', () => {
    expect([5, 6]).toContain(binarySearch([1, 3, 4, 4, 6, 7, 8], 7));
  });

  test('complicated example 7', () => {
    expect([6, 7]).toContain(binarySearch([1, 3, 4, 4, 6, 7, 8], 8));
  });

  test('complicated example 8', () => {
    expect(binarySearch([1, 3, 4, 4, 6, 7, 8], 9)).toBe(7);
  });
});
