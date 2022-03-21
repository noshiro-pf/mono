import { getHours } from './hours';
import { getMinutes, setMinutes } from './minutes';

const date_20191225_2359 = new Date('2019/12/25 23:59');

test('setMinutes(2019/12/25 23:59, 0)', () => {
  const result = setMinutes(date_20191225_2359, 0);

  expect(getHours(result)).toBe(23);
  expect(getMinutes(result)).toBe(0);
});
