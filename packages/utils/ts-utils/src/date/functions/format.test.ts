import { toHM, toHMS, toYMD, toYMDHMS } from './format';

test('toYMD', () => {
  expect(toYMD(new Date('2020/1/1'), '/')).toBe('2020/01/01');
});

test('toYMD', () => {
  expect(toYMD(new Date('2020/1/1'), '-')).toBe('2020-01-01');
});

test('toHM', () => {
  expect(toHM(new Date('2020/1/1 12:34:56'), ':')).toBe('12:34');
});

test('toHM', () => {
  expect(toHM(new Date('2020/1/1 12:34:56'), '.')).toBe('12.34');
});

test('toHMS', () => {
  expect(toHMS(new Date('2020/1/1 12:34:56'), ':')).toBe('12:34:56');
});

test('toHMS', () => {
  expect(toHMS(new Date('2020/1/1 12:34:56'), '.')).toBe('12.34.56');
});

test('toHMS', () => {
  expect(toYMDHMS(new Date('2020/1/1 12:34:56'), '/', ':')).toBe(
    '2020/01/01 12:34:56'
  );
});

test('toHMS', () => {
  expect(toYMDHMS(new Date('2020/1/1 12:34:56'), '@', '*')).toBe(
    '2020@01@01 12*34*56'
  );
});
