import { expectType } from '../expect-type.mjs';
import { castDeepMutable, castMutable } from './cast-mutable.mjs';

describe('castMutable', () => {
  test('should allow mutating arrays that were readonly', () => {
    const readonlyArray: readonly number[] = [1, 2, 3];
    const mut_array = castMutable(readonlyArray);

    expectType<typeof mut_array, number[]>('=');

    mut_array.push(4);
    expect(mut_array).toStrictEqual([1, 2, 3, 4]);
    expect(readonlyArray).toStrictEqual([1, 2, 3, 4]);
  });

  test('should allow mutating objects that were readonly', () => {
    const readonlyUser: Readonly<{ name: string; age: number }> = {
      name: 'Alice',
      age: 30,
    };

    const mut_user = castMutable(readonlyUser);
    expectType<typeof mut_user, { name: string; age: number }>('=');

    mut_user.age = 31;
    mut_user.name = 'Bob';

    expect(mut_user).toStrictEqual({ name: 'Bob', age: 31 });
    expect(readonlyUser).toStrictEqual({ name: 'Bob', age: 31 });
  });
});

describe('castDeepMutable', () => {
  test('should enable deep mutations on nested readonly structures', () => {
    type ReadonlyState = Readonly<{
      user: {
        profile: {
          name: string;
          tags: readonly string[];
        };
      };
    }>;

    const readonlyState: ReadonlyState = {
      user: {
        profile: {
          name: 'Alice',
          tags: ['admin', 'owner'],
        },
      },
    };

    const mut_state = castDeepMutable(readonlyState);

    type MutableState = {
      user: {
        profile: {
          name: string;
          tags: string[];
        };
      };
    };

    expectType<typeof mut_state, MutableState>('~=');

    mut_state.user.profile.tags.push('editor');
    mut_state.user.profile.name = 'Bob';

    expect(mut_state.user.profile).toStrictEqual({
      name: 'Bob',
      tags: ['admin', 'owner', 'editor'],
    });
    expect(readonlyState.user.profile.tags).toStrictEqual([
      'admin',
      'owner',
      'editor',
    ]);
    expect(readonlyState.user.profile.name).toBe('Bob');
  });
});
