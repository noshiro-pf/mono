import { getDay } from './day';

test('getDay(2019/12/25)', () => {
  expect(getDay(new Date('2019/12/22'))).toBe(0);
  expect(getDay(new Date('2019/12/23'))).toBe(1);
  expect(getDay(new Date('2019/12/24'))).toBe(2);
  expect(getDay(new Date('2019/12/25'))).toBe(3);
  expect(getDay(new Date('2019/12/26'))).toBe(4);
  expect(getDay(new Date('2019/12/27'))).toBe(5);
  expect(getDay(new Date('2019/12/28'))).toBe(6);
});
