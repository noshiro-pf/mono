import { expectType } from 'ts-data-forge';
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
    } as const;

    assert.deepStrictEqual(User.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(User.is(User.defaultValue));
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      assert.deepStrictEqual(User.fill({}), User.defaultValue);
    });
  });
});
