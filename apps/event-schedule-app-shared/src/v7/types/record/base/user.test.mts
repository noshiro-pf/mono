import { expectType } from 'ts-data-forge';
import {
  toUserName,
  type UserId,
  type UserName,
} from '../../named-primitive-types.mjs';
import { fillUser, isUser, userDefaultValue, type User } from './user.mjs';

describe('User', () => {
  expectType<
    User,
    Readonly<{
      id: UserId;
      name: UserName;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: User = {
      id: null,
      name: toUserName(''),
    } as const;

    assert.deepStrictEqual(userDefaultValue, defaultValue);
  });

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
});
