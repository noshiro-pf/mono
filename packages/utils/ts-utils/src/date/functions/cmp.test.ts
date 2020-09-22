import { dateCmp } from './cmp';

test('dateCmp 1', () => {
  expect(dateCmp(new Date('2020/1/1'), new Date('2020/1/2'))).toBe(-1);
});

test('dateCmp 2', () => {
  expect(dateCmp(new Date('2020/1/1'), new Date('2020/1/1'))).toBe(0);
});

test('dateCmp 3', () => {
  expect(dateCmp(new Date('2020/1/2'), new Date('2020/1/1'))).toBe(1);
});

test('dateCmp 4', () => {
  expect(
    dateCmp(new Date('2020/1/1 00:00:00'), new Date('2020/1/1 00:00:01'))
  ).toBe(-1);
});
