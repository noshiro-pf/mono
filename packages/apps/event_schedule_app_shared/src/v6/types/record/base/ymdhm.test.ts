import { fillYmdhm, isYmdhm, ymdhmDefaultValue } from './ymdhm';

describe('isYmdhm', () => {
  test('defaultValue should be true', () => {
    expect(isYmdhm(ymdhmDefaultValue)).toBe(true);
  });
});

describe('fillYmdhm', () => {
  test('defaultValue should be true', () => {
    expect(fillYmdhm({})).toStrictEqual(ymdhmDefaultValue);
  });
});
