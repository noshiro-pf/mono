import { ituple } from '../others';

export const getShuffled = <T extends readonly unknown[]>(
  arr: T
): {
  readonly [K in keyof T]: T[number];
} =>
  [...arr]
    .map((e) => ituple(e, Math.random()))
    .sort((x, y) => x[1] - y[1])
    .map<T[number]>((pair) => pair[0]) as {
    readonly [K in keyof T]: T[number];
  };
