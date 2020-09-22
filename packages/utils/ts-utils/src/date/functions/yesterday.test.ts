import { getYestereday } from './yesterday';

test('getYestereday 1', () => {
  expect(getYestereday(new Date('2020/01/02'))).toEqual(new Date('2020/01/01'));
});

test('getYestereday 2', () => {
  expect(getYestereday(new Date('2021/01/01'))).toEqual(new Date('2020/12/31'));
});
