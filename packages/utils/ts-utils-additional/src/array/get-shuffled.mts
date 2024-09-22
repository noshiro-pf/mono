import { pipe, tp, Tpl } from '@noshiro/ts-utils';

export const getShuffled = <T extends readonly unknown[]>(
  arr: T,
): Readonly<{ [_K in keyof T]: T[number] }> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  pipe(Array.from(arr, (e) => tp(e, Math.random())))
    .chain((list) => list.toSorted((x, y) => x[1] - y[1]))
    .chain((list) => Tpl.map(list, (pair) => pair[0])).value as Readonly<{
    [_K in keyof T]: T[number];
  }>;
