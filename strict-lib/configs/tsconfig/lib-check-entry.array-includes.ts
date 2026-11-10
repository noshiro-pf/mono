// How `Array#includes` / `ReadonlyArray#includes` narrow their argument, one
// pattern per function, for the twelve harnesses to hold and for the
// strict-ts-lib documentation to draw its examples from. Every harness's
// `tsconfig.lib-check.json` and `tsconfig.lib-check.webworker.json` name this
// file.
//
// The declaration is three overloads, tried in order:
//
// 1. `includes(searchElement: T): boolean` — an argument of the element type
//    itself is not narrowed.
// 2. `includes<S extends WidenLiteral<T> & {}>(this: [S] extends
//    [Exclude<S, T>] ? unknown : never, searchElement: S): searchElement is
//    S & T` — an argument none of whose members is in `T` is narrowed on the
//    true branch. The false branch of a type predicate removes the members of
//    `T`, and such an argument has none, so it keeps its type there.
// 3. `includes(searchElement: WidenLiteral<T> & {}): boolean` — any other
//    argument, one whose type overlaps `T` in part, is not narrowed.
//
// A type predicate narrows both branches, but a `false` from `includes` means
// "not in this array", not "not of type `T`" (#2879). Before, the one
// signature was `searchElement is T`, and its false branch removed the members
// of `T` whatever the argument was. Each function below says where that
// differed.

import type { TypeEq } from 'ts-type-forge';

type Letter = 'a' | 'b';

/**
 * An argument of the element type: not narrowed on either branch.
 *
 * Before: `i` was `never` on the false branch, since every member of `number`
 * is in `T = number`.
 */
export const argumentOfElementType = (
  numbers: readonly number[],
  i: number,
): readonly true[] =>
  numbers.includes(i)
    ? [true satisfies TypeEq<typeof i, number>]
    : [true satisfies TypeEq<typeof i, number>];

/**
 * A literal of the element type: not narrowed, as with any argument of the
 * element type.
 *
 * Before: `a` was `never` on the false branch, though `letters` may not hold
 * `'a'`.
 */
export const literalOfElementType = (
  letters: readonly Letter[],
  a: 'a',
): readonly true[] =>
  letters.includes(a)
    ? [true satisfies TypeEq<typeof a, 'a'>]
    : [true satisfies TypeEq<typeof a, 'a'>];

/**
 * A wider argument against a literal union: narrowed to the union on the true
 * branch, and left as it is on the false branch. This is what `includes` is
 * declared generic for. Unchanged.
 */
export const widerArgument = (
  letters: readonly Letter[],
  s: string,
): readonly true[] =>
  letters.includes(s)
    ? [true satisfies TypeEq<typeof s, Letter>]
    : [true satisfies TypeEq<typeof s, string>];

/** The same, for a `const` tuple of keys. Unchanged. */
export const widerArgumentAgainstConstTuple = (s: string): readonly true[] => {
  const keys = ['x', 'y'] as const;

  return keys.includes(s)
    ? [true satisfies TypeEq<typeof s, 'x' | 'y'>]
    : [true satisfies TypeEq<typeof s, string>];
};

/** The same, for number literals. Unchanged. */
export const widerNumberArgument = (
  digits: readonly (1 | 2 | 3)[],
  n: number,
): readonly true[] =>
  digits.includes(n)
    ? [true satisfies TypeEq<typeof n, 1 | 2 | 3>]
    : [true satisfies TypeEq<typeof n, number>];

/** The same, for a template literal type. Unchanged. */
export const templateLiteralArgument = (
  ids: readonly ('id-a' | 'id-b')[],
  s: `id-${string}`,
): readonly true[] =>
  ids.includes(s)
    ? [true satisfies TypeEq<typeof s, 'id-a' | 'id-b'>]
    : [true satisfies TypeEq<typeof s, `id-${string}`>];

/**
 * An argument that overlaps the element type in part: not narrowed on either
 * branch.
 *
 * Before: `s` was `'a'` on the true branch and `'c'` on the false one. The
 * false branch was wrong, since `letters` may not hold `'a'`. The true branch
 * was right, and is the precision this gives up: a type predicate cannot narrow
 * one branch alone. Compare with `s === 'a'` where that is wanted.
 */
export const argumentOverlappingElementType = (
  letters: readonly Letter[],
  s: 'a' | 'c',
): readonly true[] =>
  letters.includes(s)
    ? [true satisfies TypeEq<typeof s, 'a' | 'c'>]
    : [true satisfies TypeEq<typeof s, 'a' | 'c'>];

/**
 * `boolean` against `true[]`: `boolean` is `true | false`, which overlaps
 * `true`, so it is not narrowed either.
 *
 * Before: `b` was `true` on the true branch and `false` on the false one,
 * though an empty array returns `false` for a `true`.
 */
export const booleanArgument = (
  trues: readonly true[],
  b: boolean,
): readonly true[] =>
  trues.includes(b)
    ? [true satisfies TypeEq<typeof b, boolean>]
    : [true satisfies TypeEq<typeof b, boolean>];

/**
 * An argument disjoint from the element type: `never` on the true branch,
 * which cannot be taken, and left as it is on the false branch. Unchanged.
 */
export const argumentDisjointFromElementType = (
  letters: readonly Letter[],
  s: 'c' | 'd',
): readonly true[] =>
  letters.includes(s)
    ? [true satisfies TypeEq<typeof s, never>]
    : [true satisfies TypeEq<typeof s, 'c' | 'd'>];

/**
 * An argument outside the widened element type is refused, `undefined`
 * included (the parameter is `WidenLiteral<T> & {}`). Unchanged.
 */
export const refusedArguments = (
  letters: readonly Letter[],
  v: string | number,
  u: string | undefined,
): readonly boolean[] => [
  // @ts-expect-error `number` is not a `string`, the widened `Letter`.
  letters.includes(v),
  // @ts-expect-error `undefined` is excluded by `& {}`.
  letters.includes(u),
];
