// Verifies that the built `dist/` output works through the real
// `package.json` `exports` map via named imports. This file is
// self-contained (no test-library imports) so any TypeScript version in the
// compatibility matrix can type-check it.

import { asInt, number, record } from 'ts-fortress';

type ExpectTrue<B extends true> = B;

// `0 extends 1 & T` is only true when T is `any`; this asserts the named
// import resolved to a real, non-`any` typed value through the exports map.
type NotAny<T> = 0 extends 1 & T ? false : true;

// The constraint values a type carries are part of its declared type, so they
// have to survive declaration emit — that is where `Type<A>`'s variance has
// caught us out before. A specified constraint keeps its literal type and an
// unspecified one stays `undefined`, both without `?.`.
const constrained = number(0, { min: 0, max: 120 });

const max: 120 = constrained.constraints.max;

const step: undefined = constrained.constraints.step;

// ... and are still reachable through a record's shape.
const maxViaShape: 120 = record({ age: constrained }).shape.age.constraints.max;

type _Cases = readonly [
  ExpectTrue<NotAny<typeof asInt>>,
  ExpectTrue<NotAny<typeof max>>,
  ExpectTrue<NotAny<typeof step>>,
  ExpectTrue<NotAny<typeof maxViaShape>>,
];

export type { _Cases };
