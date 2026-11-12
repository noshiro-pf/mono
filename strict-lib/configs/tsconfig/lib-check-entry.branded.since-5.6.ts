// The assertions of `lib-check-entry.branded.ts` that hold only from
// TypeScript 5.6 on. The `tsconfig.lib-files-check.branded.json` of the
// harnesses from v5.6 name this file beside that one; v5.0–v5.5 do not.

import type { TypeEq } from 'ts-type-forge';

/**
 * #4012 — TypeScript 6.0 renamed `lib.esnext.iterator.d.ts` (the iterator
 * helpers, from TypeScript 5.6) to `lib.es2025.iterator.d.ts`, and the
 * converter, registered under the old name, stopped running: the counts of
 * `take` and `drop` went back to `number`.
 */
export const iteratorHelperTypes = [
  true satisfies TypeEq<
    Parameters<IteratorObject<number>['take']>[0],
    NumberType.ArraySizeArgNonNegative
  >,
  true satisfies TypeEq<
    Parameters<IteratorObject<number>['drop']>[0],
    NumberType.ArraySizeArgNonNegative
  >,
] as const;

// `Parameters` above reads the last overload alone; a call is checked against
// every one, so with an overload that still takes a plain `number` the calls
// below resolve and their `@ts-expect-error` goes unused.
declare const numbers: IteratorObject<number>;

declare const plainNumber: number;

// @ts-expect-error A plain `number` is no count.
export const takenByPlainNumber = numbers.take(plainNumber);

// @ts-expect-error A plain `number` is no count.
export const droppedByPlainNumber = numbers.drop(plainNumber);
