import { getHours, setHours } from './hours';
import { getMinutes } from './minutes';

const date_20191225_2359 = new Date('2019/12/25 23:59');

test('setHours(2019/12/25 23:59, 0)', () => {
  const result = setHours(date_20191225_2359, 0);

  expect(getHours(result)).toBe(0);
  expect(getMinutes(result)).toBe(59);
});
