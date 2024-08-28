import { match } from './match.mjs';

describe('match', () => {
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
