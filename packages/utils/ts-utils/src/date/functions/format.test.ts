import { toHM, toHMS, toYMD, toYMDHMS } from './format';

describe('toYMD', () => {
  test('case 1', () => {
    expect(toYMD(new Date('2020/1/1'), '/')).toBe('2020/01/01');
  });

  test('case 2', () => {
    expect(toYMD(new Date('2020/1/1'), '-')).toBe('2020-01-01');
  });
});

describe('toHM', () => {
  test('case 1', () => {
    expect(toHM(new Date('2020/1/1 12:34:56'), ':')).toBe('12:34');
  });

  test('case 2', () => {
    expect(toHM(new Date('2020/1/1 12:34:56'), '.')).toBe('12.34');
  });
});

describe('toHMS', () => {
  test('case 1', () => {
    expect(toHMS(new Date('2020/1/1 12:34:56'), ':')).toBe('12:34:56');
  });

  test('case 2', () => {
    expect(toHMS(new Date('2020/1/1 12:34:56'), '.')).toBe('12.34.56');
  });

  test('case 3', () => {
    expect(toYMDHMS(new Date('2020/1/1 12:34:56'), '/', ':')).toBe(
      '2020/01/01 12:34:56'
    );
  });

  test('case 4', () => {
    expect(toYMDHMS(new Date('2020/1/1 12:34:56'), '@', '*')).toBe(
      '2020@01@01 12*34*56'
    );
  });
});
