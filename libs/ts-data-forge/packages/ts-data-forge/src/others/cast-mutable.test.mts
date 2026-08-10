import { expectType } from '../expect-type.mjs';
import { castDeepMutable, castMutable } from './cast-mutable.mjs';

describe(castMutable, () => {
  test('should allow mutating arrays that were readonly', () => {
    const readonlyArray: readonly number[] = [1, 2, 3] as const;

    const mut_array = castMutable(readonlyArray);

    // transformer-ignore-next-line
    expectType<typeof mut_array, number[]>('=');

    mut_array.push(4);

    assert.deepStrictEqual(mut_array, [1, 2, 3, 4]);

    assert.deepStrictEqual(readonlyArray, [1, 2, 3, 4]);
  });

  test('should allow mutating objects that were readonly', () => {
    const readonlyUser: Readonly<{ name: string; age: number }> = {
      name: 'Alice',
      age: 30,
    } as const;

    const mut_user = castMutable(readonlyUser);

    // transformer-ignore-next-line
    expectType<typeof mut_user, { name: string; age: number }>('=');

    mut_user.age = 31;

    mut_user.name = 'Bob';

    assert.deepStrictEqual(mut_user, { name: 'Bob', age: 31 });

    assert.deepStrictEqual(readonlyUser, { name: 'Bob', age: 31 });
  });
});

describe(castDeepMutable, () => {
  test('should enable deep mutations on nested readonly structures', () => {
    type ReadonlyState = Readonly<{
      user: Readonly<{
        profile: Readonly<{
          name: string;
          tags: readonly string[];
        }>;
      }>;
    }>;

    const readonlyState: ReadonlyState = {
      user: {
        profile: {
          name: 'Alice',
          tags: ['admin', 'owner'],
        },
      },
    } as const;

    const mut_state = castDeepMutable(readonlyState);

    // transformer-ignore-next-line
    type MutableState = {
      user: {
        profile: {
          name: string;
          tags: string[];
        };
      };
    };

    expectType<typeof mut_state, MutableState>('=');

    mut_state.user.profile.tags.push('editor');

    mut_state.user.profile.name = 'Bob';

    assert.deepStrictEqual(mut_state.user.profile, {
      name: 'Bob',
      tags: ['admin', 'owner', 'editor'],
    });

    assert.deepStrictEqual(readonlyState.user.profile.tags, [
      'admin',
      'owner',
      'editor',
    ]);

    expect(readonlyState.user.profile.name).toBe('Bob');
  });
});
