import { expectType } from '../expect-type.mjs';
import { match, type _IsLiteralType } from './match.mjs';

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

  expectTypeOf(res).toEqualTypeOf<2 | 3 | 4 | 5>();

  const res2 = match(direction as string, {
    E: 2,
    N: 3,
    S: 4,
    W: 5,
  });

  expectTypeOf(res2).toEqualTypeOf<2 | 3 | 4 | 5 | undefined>();

  const res3 =
    match('N' as string, {
      E: 2,
      N: 3,
      S: 4,
      W: 5,
    }) ?? 999;

  expectTypeOf(res3).toEqualTypeOf<number>();

  test('dummy', () => {
    expect(true).toBe(true);
  });
});
