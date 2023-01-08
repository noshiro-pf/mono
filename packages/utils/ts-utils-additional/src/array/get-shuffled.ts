import { Arr, pipe, tp } from '@noshiro/ts-utils';

export const getShuffled = <T extends readonly unknown[]>(
  arr: T
): {
  readonly [K in keyof T]: T[number];
} =>
  pipe(Arr.fromMapped(arr, (e) => tp(e, Math.random())))
    .chain((list) => Arr.sort(list, (x, y) => x[1] - y[1]))
    .chain((list) => Arr.map(list, (pair) => pair[0])).value as {
    readonly [K in keyof T]: T[number];
  };
