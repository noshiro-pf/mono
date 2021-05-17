import type { uint32 } from '../../types';
import { swap } from './swap';

test('swap', () => {
  const array = [1, 2, 3, 4, 5];
  swap(array, 2 as uint32, 4 as uint32);
  expect(array).toEqual([1, 2, 5, 4, 3]);
});

test('swap no change', () => {
  const array = [1, 2, 3, 4, 5];
  swap(array, 2 as uint32, 2 as uint32);
  expect(array).toEqual([1, 2, 3, 4, 5]);
});

test('swap out of range', () => {
  const array = [1, 2, 3, 4, 5];
  swap(array, 6 as uint32, 2 as uint32);
  expect(array).toEqual([1, 2, 3, 4, 5]);
});
