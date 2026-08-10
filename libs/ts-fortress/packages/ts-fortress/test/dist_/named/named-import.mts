// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports. This file is
// self-contained (no test-library imports) so any TypeScript version in the
// compatibility matrix can type-check it.

import { asInt } from 'ts-fortress';

type ExpectTrue<B extends true> = B;

// `0 extends 1 & T` is only true when T is `any`; this asserts the named
// import resolved to a real, non-`any` typed value through the exports map.
type NotAny<T> = 0 extends 1 & T ? false : true;

type _Cases = readonly [ExpectTrue<NotAny<typeof asInt>>];

export type { _Cases };
