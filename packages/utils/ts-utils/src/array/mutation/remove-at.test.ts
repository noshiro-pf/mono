import { uint32 } from '../../types';
import { removeAt } from './remove-at';

test('removeAt middle', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 2 as uint32;
  const result = removeAt(array, index);
  expect(array).toEqual([1, 2, 4, 5]);
  expect(result).toBe(3);
});

test('removeAt first', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 0 as uint32;
  const result = removeAt(array, index);
  expect(array).toEqual([2, 3, 4, 5]);
  expect(result).toBe(1);
});

test('removeAt last', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 4 as uint32;
  const result = removeAt(array, index);
  expect(array).toEqual([1, 2, 3, 4]);
  expect(result).toBe(5);
});

test('removeAt out of range', () => {
  const array = [1, 2, 3, 4, 5];
  const index = 9 as uint32;
  const result = removeAt(array, index);
  expect(array).toEqual([1, 2, 3, 4, 5]);
  expect(result).toBe(undefined);
});

test('removeAt out of range', () => {
  const array: number[] = [];
  const index = 1 as uint32;
  const result = removeAt(array, index);
  expect(array).toEqual([]);
  expect(result).toBe(undefined);
});
