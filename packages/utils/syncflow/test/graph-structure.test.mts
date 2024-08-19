import { combine, map, of, withCurrentValueFrom } from '../src/index.mjs';

describe('graph-structure', () => {
  test('case 1', () => {
    /*
     *  [ counter ]
     *      |
     *      |
     *  [ double ]
     *     |  \
     *     | [quad]
     *     |    |
     *     |    |
     *  [ combined ]
     */
    const source$ = of(0);
    const double$ = source$.chain(map((x) => x * 2));
    const quad$ = source$.chain(map((x) => x * 2)).chain(map((x) => x * 2));
    const combined$ = combine([source$, double$, quad$] as const);

    expect(source$.depth).toBe(0);
    expect(double$.depth).toBe(1);
    expect(quad$.depth).toBe(2);
    expect(combined$.depth).toBe(3);
  });

  test('case 2', () => {
    const source$ = of(0);
    const double$ = source$.chain(map((x) => x * 2));
    const combined$ = double$.chain(withCurrentValueFrom(source$));

    expect(source$.depth).toBe(0);
    expect(double$.depth).toBe(1);
    expect(combined$.depth).toBe(2);
  });

  test('case 3', () => {
    const source$ = of(0);
    const double$ = source$.chain(map((x) => x * 2));
    const quad$ = source$.chain(map((x) => x * 2)).chain(map((x) => x * 2));
    const combined$ = double$
      .chain(withCurrentValueFrom(source$))
      .chain(withCurrentValueFrom(quad$));

    expect(source$.depth).toBe(0);
    expect(double$.depth).toBe(1);
    expect(quad$.depth).toBe(2);
    expect(combined$.depth).toBe(3);
  });
});
