import { weekNumber } from './week-number';

test('weekNumber 1', () => {
  expect(weekNumber(new Date('2020/01/01'))).toBe(0);
});

test('weekNumber 2', () => {
  expect(weekNumber(new Date('2020/09/22'))).toBe(3);
});

test('weekNumber 3', () => {
  expect(weekNumber(new Date('2020/09/26'))).toBe(3);
});

test('weekNumber 4', () => {
  expect(weekNumber(new Date('2020/09/27'))).toBe(4);
});
