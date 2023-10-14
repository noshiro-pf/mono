import { expectType } from '../expect-type';
import { pipe } from './pipe';

describe('pipe', () => {
  test('case 1', () => {
    expect(
      pipe(1)
        .chain((x) => x * 2)
        .chain((x) => x.toString()).value,
    ).toBe('2');
  });

  test('case 2', () => {
    expect(
      pipe({ x: 2, y: 3 } as const)
        .chain((p) => ({ x: p.x, y: p.y * 4 }) as const)
        .chain((p) => ({ x: p.x * 5, y: p.y })).value,
    ).toStrictEqual({ x: 10, y: 12 });
  });

  test('case 3', () => {
    // eslint-disable-next-line no-restricted-syntax
    const y = 1 as number | undefined;

    const z = pipe(y)
      .chainOptional((x) => x + 1)
      .chainOptional((x) => `${x}`).value;

    expectType<typeof z, string | undefined>('=');

    expect(z).toBe('2');
  });
});
