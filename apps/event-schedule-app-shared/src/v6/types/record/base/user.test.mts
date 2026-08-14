import { fillUser, isUser, userDefaultValue } from './user.mjs';

describe('isUser', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isUser(userDefaultValue));
  });
});

describe('fillUser', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillUser({}), userDefaultValue);
  });
});
