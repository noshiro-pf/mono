export const getShuffled = <T>(arr: readonly T[]): T[] =>
  arr
    .map<[T, number]>((e) => [e, Math.random()])
    .sort((x, y) => x[1] - y[1])
    .map<T>((pair) => pair[0]);
