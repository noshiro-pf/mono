import { getDate } from './date';
import { getMonth, setMonth } from './month';
import { getYear } from './year';

const date_20191225 = new Date('2019/12/25');

test('setMonth(2019/12/25, 11)', () => {
  const result = setMonth(date_20191225, 6);
  expect(getYear(result)).toBe(2019);
  expect(getMonth(result)).toBe(6);
  expect(getDate(result)).toBe(25);
});
