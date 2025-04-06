import { expectType } from '../expect-type.mjs';
import { match, strictMatch } from './match.mjs';

describe('strictMatch', () => {
  type Direction = 'E' | 'N' | 'S' | 'W';
  const direction: Direction = 'N' as Direction;

  test('literal union', () => {
    const res = strictMatch(direction, {
      E: 2,
      N: 3,
      S: 4,
      W: 5,
    });

    expectType<typeof res, 2 | 3 | 4 | 5>('=');

    expect(res).toBe(3);
  });

  test('Missing key cases with literal union', () => {
    // @ts-expect-error key iw missing
    const res = strictMatch(direction, {
      E: 2,
      S: 4,
      W: 5,
    });

    expectType<typeof res, unknown>('=');

    expect(res).toBeUndefined();
  });

  test('Missing key cases with string', () => {
    const res = strictMatch(direction as string, {
      E: 2,
      S: 4,
      W: 5,
    });

    expectType<typeof res, unknown>('=');

    expect(res).toBeUndefined();
  });
});

describe('match', () => {
  type Direction = 'E' | 'N' | 'S' | 'W';
  const direction: Direction = 'N' as Direction;

  test('literal union', () => {
    const res = match(direction, {
      E: 2,
      N: 3,
      S: 4,
      W: 5,
    });

    expectType<typeof res, 2 | 3 | 4 | 5>('=');

    expect(res).toBe(3);
  });

  test('string key', () => {
    const res = match(direction as string, {
      E: 2,
      N: 3,
      S: 4,
      W: 5,
    });

    expectType<typeof res, 2 | 3 | 4 | 5 | undefined>('=');

    expect(res).toBe(3);
  });

  test('Missing key cases with literal union', () => {
    const res = match(direction, {
      E: 2,
      S: 4,
      W: 5,
    });

    expectType<typeof res, 2 | 4 | 5>('=');

    expect(res).toBeUndefined();
  });

  test('Missing key cases with string', () => {
    const res =
      match(direction as string, {
        E: 2,
        S: 4,
        W: 5,
      }) ?? 999;

    expectType<typeof res, 2 | 4 | 5 | 999>('=');

    expect(res).toBe(999);
  });
});
