// What `Object.fromEntries` returns, for the twelve harnesses to hold. Every
// harness's `tsconfig.lib-check.json` and `tsconfig.lib-check.webworker.json`
// name this file. `fromEntriesTypes` in `lib-check-entry.branded.ts` holds the
// same cases for the branded flavor, whose results are readonly.
//
// #2877 — a key the entries may not set came out present, and a repeated key
// came out `never`.

import type { TypeEq } from 'ts-type-forge';

/** Distinct literal keys are all present. */
export const distinctKeys = (): true => {
  const obj = Object.fromEntries([
    ['x', 1],
    ['y', 3],
  ]);

  return true satisfies TypeEq<typeof obj, { x: 1; y: 3 }>;
};

/** A later entry replaces an earlier one with the same key, as at run time. */
export const repeatedKey = (): true => {
  const obj = Object.fromEntries([
    ['x', 1],
    ['x', 2],
  ]);

  return true satisfies TypeEq<typeof obj, { x: 2 }>;
};

/** An entry whose key is a union sets one of its members, so each is optional. */
export const unionKey = (k: 'x' | 'y'): true => {
  const obj = Object.fromEntries([[k, 1]]);

  return true satisfies TypeEq<typeof obj, { x?: 1; y?: 1 }>;
};

/**
 * A union-keyed entry after one that set a member of the union: that key stays
 * present, with either value.
 */
export const unionKeyAfterLiteral = (k: 'x' | 'y'): true => {
  const obj = Object.fromEntries([
    ['x', 1],
    [k, 2],
  ]);

  return true satisfies TypeEq<typeof obj, { x: 1 | 2; y?: 2 }>;
};

/** A literal-keyed entry after a union-keyed one sets its key for certain. */
export const literalKeyAfterUnion = (k: 'x' | 'y'): true => {
  const obj = Object.fromEntries([
    [k, 1],
    ['x', 2],
  ]);

  return true satisfies TypeEq<typeof obj, { y?: 1; x: 2 }>;
};

/** An iterable that is not an array, whose keys need not cover the union. */
export const mapWithUnionKey = (map: ReadonlyMap<'a' | 'b', number>): true => {
  const obj = Object.fromEntries(map);

  return true satisfies TypeEq<typeof obj, { a?: number; b?: number }>;
};

/** A key with no literal gives an index signature, with no `undefined`. */
export const indexSignatureKey = (s: string): true => {
  const obj = Object.fromEntries([[s, 1]]);

  return true satisfies TypeEq<typeof obj, { [k: string]: 1 }>;
};

/** A union of index-signature keys is not made `Partial`. */
export const mapWithIndexSignatureKeys = (
  map: ReadonlyMap<`a-${string}` | `b-${string}`, number>,
): true => {
  const obj = Object.fromEntries(map);

  return true satisfies TypeEq<
    typeof obj,
    { [k: `a-${string}`]: number; [k: `b-${string}`]: number }
  >;
};

/**
 * A union of a literal and an open `string`, as `Object.entries` gives for a
 * record with literal keys, is still made `Partial`.
 */
export const mapWithOpenStringKey = (
  map: ReadonlyMap<'a' | (string & {}), number>,
): true => {
  const obj = Object.fromEntries(map);

  return true satisfies TypeEq<(typeof obj)['a'], number | undefined>;
};
