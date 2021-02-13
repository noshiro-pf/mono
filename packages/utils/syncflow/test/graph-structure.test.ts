import { describe, test } from '@jest/globals';
import { combineLatest, interval, map, withLatestFrom } from '../src';

describe('combineLatest', () => {
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
    const counter$ = interval(1000);
    const double$ = counter$.chain(map((x) => x * 2));
    const quad$ = counter$.chain(map((x) => x * 2)).chain(map((x) => x * 2));
    const combined$ = combineLatest(counter$, double$, quad$);

    expect(counter$.depth).toBe(0);
    expect(double$.depth).toBe(1);
    expect(quad$.depth).toBe(2);
    expect(combined$.depth).toBe(3);
  });

  test('case 2', () => {
    const counter$ = interval(1000);
    const double$ = counter$.chain(map((x) => x * 2));
    const combined$ = double$.chain(withLatestFrom(counter$));

    expect(counter$.depth).toBe(0);
    expect(double$.depth).toBe(1);
    expect(combined$.depth).toBe(2);
  });

  test('case 3', () => {
    const counter$ = interval(1000);
    const double$ = counter$.chain(map((x) => x * 2));
    const quad$ = counter$.chain(map((x) => x * 2)).chain(map((x) => x * 2));
    const combined$ = double$
      .chain(withLatestFrom(counter$))
      .chain(withLatestFrom(quad$));

    expect(counter$.depth).toBe(0);
    expect(double$.depth).toBe(1);
    expect(quad$.depth).toBe(2);
    expect(combined$.depth).toBe(3);
  });
});
