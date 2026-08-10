// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports. This file is
// self-contained (no test-library imports) so any TypeScript version in the
// compatibility matrix can type-check it.

import { appendAsConstTransformer } from 'ts-codemod-lib';

type ExpectTrue<B extends true> = B;

type IsFunction<T> = T extends (...args: never) => unknown ? true : false;

type _Cases = readonly [
  ExpectTrue<IsFunction<typeof appendAsConstTransformer>>,
];

export type { _Cases };
