// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports. This file is
// self-contained (no test-library imports) so any TypeScript version in the
// compatibility matrix can type-check it.

import { isDirectlyExecuted } from 'ts-repo-utils';

type ExpectTrue<B extends true> = B;

type _Cases = readonly [
  // `isDirectlyExecuted` resolves through the package exports and is callable
  // with a boolean return (signature-tolerant assertion).
  ExpectTrue<
    ReturnType<typeof isDirectlyExecuted> extends boolean ? true : false
  >,
];

export type { _Cases };
