import { expect, test } from 'vitest';
import { removeAt } from './remove-at.mjs';

test('removeAt middle', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 2;
  const result = removeAt(array, index);

  expect(array).toStrictEqual([1, 2, 4, 5]);
  expect(result).toBe(3);
});

test('removeAt first', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 0;
  const result = removeAt(array, index);

  expect(array).toStrictEqual([2, 3, 4, 5]);
  expect(result).toBe(1);
});

test('removeAt last', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 4;
  const result = removeAt(array, index);

  expect(array).toStrictEqual([1, 2, 3, 4]);
  expect(result).toBe(5);
});

test('removeAt out of range case 1', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 9;
  const result = removeAt(array, index);

  expect(array).toStrictEqual([1, 2, 3, 4, 5]);
  expect(result).toBeUndefined();
});

test('removeAt out of range case 2', () => {
  const mut_array: number[] = [];
  const index = 1;
  const result = removeAt(mut_array, index);

  expect(mut_array).toStrictEqual([]);
  expect(result).toBeUndefined();
});
