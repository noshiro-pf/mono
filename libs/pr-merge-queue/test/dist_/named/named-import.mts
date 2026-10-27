// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports. This file is
// self-contained (no test-library imports) so any TypeScript version in the
// compatibility matrix can type-check it.

import { sh, type QueueState } from 'pr-merge-queue';

type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type ExpectTrue<B extends true> = B;

const quoted = sh("it's");

// The package resolves and its public types are usable.
type _Cases = readonly [
  ExpectTrue<TypeEq<typeof quoted, string>>,
  ExpectTrue<TypeEq<QueueState, QueueState>>,
];

export type { _Cases };
