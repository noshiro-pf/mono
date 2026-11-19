// Watches what `LARGEST_LITERAL_COUNT` in
// `src/rules/prefer-canonical-array-slicing.mts` rests on: `Arr.take` and its
// kin take a literal count up to 39, and a larger one fails to compile without
// `asUint32`. `check:types` fails once the directive below goes unused, or the
// call above it stops compiling.

import { Arr } from 'ts-data-forge';

declare const xs: readonly number[];

export const largest = Arr.take(xs, 39);

// @ts-expect-error TS2345: a literal above 39 is not a count `Arr.take` takes.
export const tooLarge = Arr.take(xs, 40);
