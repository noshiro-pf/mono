import { toMidnight } from './midnight';

test('toMidnight', () => {
  expect(toMidnight(new Date('2020/1/1 12:34:56'))).toStrictEqual(
    new Date('2020/1/1 00:00:00')
  );
});
