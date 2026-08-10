import { expectType } from '@noshiro/ts-utils';
import { UserName, type UserId } from '../../named-primitive-types.mjs';
import { User } from './user.mjs';

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
      name: UserName.cast(''),
    };
    expect(User.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(User.is(User.defaultValue)).toBe(true);
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      expect(User.fill({})).toStrictEqual(User.defaultValue);
    });
  });
});
