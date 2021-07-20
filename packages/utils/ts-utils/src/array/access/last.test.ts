import { last } from './last';

test('last', () => {
  expect(last([1, 2, 3, 4, 5])).toEqual(5);
});
test('last', () => {
  expect(last<unknown>([])).toEqual(undefined);
});
test('last', () => {
  expect(last([1, 2, 3])).toEqual(3);
});
