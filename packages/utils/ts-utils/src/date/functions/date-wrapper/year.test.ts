import { getDate } from './date';
import { getMonth } from './month';
import { getYear, setYear } from './year';

const date_20191225 = new Date('2019/12/25');

test('setYear(2019/12/25, 2018)', () => {
  const result = setYear(date_20191225, 2018);
  expect(getYear(result)).toBe(2018);
  expect(getMonth(result)).toBe(12);
  expect(getDate(result)).toBe(25);
});
