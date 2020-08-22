import { pushValues } from './push-values';

test('push values 1', () => {
  const ar1 = [1, 2, 3];
  const values = [4, 5, 6];
  const result = pushValues(ar1, values);
  expect(ar1).toEqual([1, 2, 3, 4, 5, 6]);
  expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  expect(values).toEqual([4, 5, 6]);
});

test('push values 2', () => {
  const ar1: number[] = [];
  const values = [4, 5, 6];
  const result = pushValues(ar1, values);
  expect(ar1).toEqual([4, 5, 6]);
  expect(result).toEqual([4, 5, 6]);
  expect(values).toEqual([4, 5, 6]);
});
