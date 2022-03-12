import { getTomorrow } from './tomorrow';

test('getTomorrow 1', () => {
  expect(getTomorrow(new Date('2020/01/01'))).toStrictEqual(
    new Date('2020/01/02')
  );
});

test('getTomorrow 2', () => {
  expect(getTomorrow(new Date('2020/12/31'))).toStrictEqual(
    new Date('2021/01/01')
  );
});
