import { tp } from 'ts-data-forge';

/**
 * A shuffled copy, keeping the tuple's length in the type.
 *
 * Ported from `@noshiro/ts-utils-additional`, which `ts-data-forge` has no
 * successor for. `apps/mahjong-scoring-tool` carries the same function for the
 * same reason.
 */
export const getShuffled = <T extends readonly unknown[]>(
  arr: T,
): Readonly<{ [K in keyof T]: T[number] }> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from(arr, (e) => tp(e, Math.random()))
    .toSorted(([, x], [, y]) => x - y)
    .map(([e]) => e) as unknown as Readonly<{ [K in keyof T]: T[number] }>;
