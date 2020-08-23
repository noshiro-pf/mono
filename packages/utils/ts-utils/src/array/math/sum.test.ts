import { sum } from './sum';

test('sum', () => {
  expect(sum([1, 2, 3])).toBe(6);
});

test('sum', () => {
  expect(sum([])).toBe(0);
});

test('sum', () => {
  expect(sum([1, 2, 3, 4])).toBe(10);
});
