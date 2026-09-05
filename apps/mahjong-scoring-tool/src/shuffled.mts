import { tp } from 'ts-data-forge';

/**
 * A shuffled copy, keeping the tuple's length in the type.
 *
 * `ts-data-forge` has no successor for this — it came from
 * `@noshiro/ts-utils-additional` before the consolidation, and only the test
 * for `createPointMap` uses it, to check that the result does not depend on
 * the order the raw scores arrive in.
 *
 * Decorate–sort–undecorate: pair each element with a random key, sort by it,
 * then drop the keys.
 */
export const getShuffled = <T extends readonly unknown[]>(
  arr: T,
): Readonly<{ [K in keyof T]: T[number] }> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from(arr, (e) => tp(e, Math.random()))
    .toSorted(([, x], [, y]) => x - y)
    .map(([e]) => e) as unknown as Readonly<{ [K in keyof T]: T[number] }>;
