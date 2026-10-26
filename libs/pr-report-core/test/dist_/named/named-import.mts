// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports. This file is
// self-contained (no test-library imports) so any TypeScript version in the
// compatibility matrix can type-check it.

import { parseMergeAfter, type ChecksSummary } from 'pr-report-core';

type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type ExpectTrue<B extends true> = B;

const declared = parseMergeAfter('Merge-After: #1');

// The package resolves and its public types are usable.
type _Cases = readonly [
  ExpectTrue<TypeEq<typeof declared, readonly number[]>>,
  ExpectTrue<TypeEq<ChecksSummary, ChecksSummary>>,
];

export type { _Cases };
