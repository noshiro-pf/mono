import { expectType } from '../expect-type';
import { match, type _IsLiteralType } from './match';

describe('match', () => {
  expectType<_IsLiteralType<'aaa'>, true>('=');
  expectType<_IsLiteralType<33>, true>('=');
  expectType<_IsLiteralType<number | 'aa'>, false>('=');
  expectType<_IsLiteralType<'aa' | 32>, true>('=');

  type Direction = 'E' | 'N' | 'S' | 'W';
  const direction: Direction = 'N';

  const res = match(direction as Direction, {
    E: 2,
    N: 3,
    S: 4,
    W: 5,
  });

  const res2 = match('N' as string, {
    E: 2,
    N: 3,
    S: 4,
    W: 5,
  });

  const res3 = match(
    'N' as string,
    {
      E: 2,
      N: 3,
      S: 4,
      W: 5,
    },
    999
  );

  expectType<typeof res, number>('=');
  expectType<typeof res2, number | undefined>('=');
  expectType<typeof res3, number>('=');

  test('dummy', () => {
    expect(true).toBe(true);
  });
});
