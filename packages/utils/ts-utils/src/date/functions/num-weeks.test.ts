import { numWeeksOfMonth, numWeeksOfSameMonth } from './num-weeks';

describe('numWeeksOfSameMonth', () => {
  test('case 1', () => {
    expect(numWeeksOfSameMonth(new Date('2020/01/01'))).toBe(5);
  });

  test('case 2', () => {
    expect(numWeeksOfSameMonth(new Date('2020/02/01'))).toBe(5);
  });

  test('case 3', () => {
    expect(numWeeksOfSameMonth(new Date('2015/02/01'))).toBe(4);
  });

  test('case 4', () => {
    expect(numWeeksOfSameMonth(new Date('2015/05/01'))).toBe(6);
  });
});

describe('numWeeksOfMonth', () => {
  test('case 1', () => {
    expect(numWeeksOfMonth(2020, 1)).toBe(5);
  });

  test('case 2', () => {
    expect(numWeeksOfMonth(2020, 2)).toBe(5);
  });

  test('case 3', () => {
    expect(numWeeksOfMonth(2015, 2)).toBe(4);
  });

  test('case 4', () => {
    expect(numWeeksOfMonth(2015, 5)).toBe(6);
  });
});
