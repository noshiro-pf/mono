import {
  getLastDateNumberOfMonth,
  getLastDateNumberOfSameMonth,
} from './get-last-date-number-of-month';

test('getLastDateNumber', () => {
  expect(getLastDateNumberOfSameMonth(new Date('2020/01/01'))).toBe(31);
});

test('getLastDateNumberOfMonth 1', () => {
  expect(getLastDateNumberOfMonth(2020, 1)).toBe(31);
});

test('getLastDateNumberOfMonth 2', () => {
  expect(getLastDateNumberOfMonth(2020, 2)).toBe(29);
});

test('getLastDateNumberOfMonth 3', () => {
  expect(getLastDateNumberOfMonth(2020, 4)).toBe(30);
});
