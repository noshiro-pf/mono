import { swap } from './swap';

test('swap', () => {
  const array = [1, 2, 3, 4, 5];
  swap(array, 2, 4);
  expect(array).toStrictEqual([1, 2, 5, 4, 3]);
});

test('swap no change', () => {
  const array = [1, 2, 3, 4, 5];
  swap(array, 2, 2);
  expect(array).toStrictEqual([1, 2, 3, 4, 5]);
});

test('swap out of range', () => {
  const array = [1, 2, 3, 4, 5];
  swap(array, 6, 2);
  expect(array).toStrictEqual([1, 2, 3, 4, 5]);
});
