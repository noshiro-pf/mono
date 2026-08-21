import { fillYmdhm, isYmdhm, ymdhmDefaultValue } from './ymdhm.mjs';

describe('isYmdhm', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isYmdhm(ymdhmDefaultValue));
  });
});

describe('fillYmdhm', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillYmdhm({}), ymdhmDefaultValue);
  });
});
