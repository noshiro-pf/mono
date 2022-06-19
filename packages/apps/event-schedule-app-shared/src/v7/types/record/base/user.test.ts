import { assertType } from '@noshiro/ts-utils';
import type { UserId, UserName } from '../../named-primitive-types';
import type { User } from './user';
import { fillUser, isUser, userDefaultValue } from './user';

describe('User', () => {
  assertType<
    TypeEq<
      User,
      Readonly<{
        id: UserId;
        name: UserName;
      }>
    >
  >();

  test('defaultValue', () => {
    const defaultValue: User = {
      id: null,
      name: '',
    };
    expect(userDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isUser', () => {
    test('defaultValue should be true', () => {
      expect(isUser(userDefaultValue)).toBe(true);
    });
  });

  describe('fillUser', () => {
    test('defaultValue should be true', () => {
      expect(fillUser({})).toStrictEqual(userDefaultValue);
    });
  });
});
