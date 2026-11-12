// Watches what `isSuggestionOnly` in
// `src/rules/prefer-canonical-array-slicing.mts` rests on: a call to `Arr.tail`
// or `Arr.butLast` on a plain array, under an annotation, fails to compile with
// TS2590 (https://github.com/noshiro-pf/mono/issues/2994). `check:types` fails
// once a directive below goes unused.

import { Arr } from 'ts-data-forge';

declare const xs: readonly number[];

// @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.
export const tail: readonly number[] = Arr.tail(xs);

// @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.
export const butLast: readonly number[] = Arr.butLast(xs);
