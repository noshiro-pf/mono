import { expectType } from '@noshiro/ts-utils';
import { describe, expect, test } from 'vitest';
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
