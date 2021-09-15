import { ituple } from '../others';

export const getShuffled = <T>(arr: readonly T[]): T[] =>
  [...arr]
    .map((e) => ituple(e, Math.random()))
    .sort((x, y) => x[1] - y[1])
    .map<T>((pair) => pair[0]);
