import { Arr, pipe, tp, Tpl } from '@noshiro/ts-utils';

export const getShuffled = <T extends readonly unknown[]>(
  arr: T
): Readonly<{ [K in keyof T]: T[number] }> =>
  pipe(Array.from(arr, (e) => tp(e, Math.random())))
    .chain((list) => Arr.sorted(list, (x, y) => x[1] - y[1]))
    .chain((list) => Tpl.map(list, (pair) => pair[0])).value as Readonly<{
    [K in keyof T]: T[number];
  }>;
