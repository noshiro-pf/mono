import { tp } from 'ts-data-forge';

/**
 * Pairs each element with a random key, sorts by it, and drops the keys.
 *
 * Written with plain array methods rather than `pipe().chain(Tpl.map(…))`:
 * `chain` is `map` now, and `Tpl` has no successor — `Arr.map` would preserve
 * the tuple shape, but the result is asserted to the mapped type anyway, so
 * there is nothing for it to preserve here.
 */
export const getShuffled = <T extends readonly unknown[]>(
  arr: T,
): Readonly<{ [K in keyof T]: T[number] }> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from(arr, (e) => tp(e, Math.random()))
    .toSorted((x, y) => x[1] - y[1])
    .map((pair) => pair[0]) as Readonly<{ [K in keyof T]: T[number] }>;
