import { average } from './average';

test('average', () => {
  expect(average([1, 2, 3])).toBe(2);
});

test('average', () => {
  expect(average([])).toBe(0);
});

test('average', () => {
  expect(average([1, 2, 3, 4])).toBe(2.5);
});
