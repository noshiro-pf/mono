import { getDate, setDate } from './date';
import { getMonth } from './month';
import { getYear } from './year';

const date_20191225 = new Date('2019/12/25');

test('setDate(2019/12/25, 23)', () => {
  const result = setDate(date_20191225, 23);

  expect(getYear(result)).toBe(2019);
  expect(getMonth(result)).toBe(12);
  expect(getDate(result)).toBe(23);
});
