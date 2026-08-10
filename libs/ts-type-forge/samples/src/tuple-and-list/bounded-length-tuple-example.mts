import { type BoundedLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T = BoundedLengthTuple<1, 3, string>;
// readonly [string] | readonly [string, string] | readonly [string, string, string]
const a: T = ['a'] as const; // ok
const b: T = ['a', 'b', 'c'] as const; // ok
// const c: T = []; // Error
// const d: T = ["a", "b", "c", "d"]; // Error

// embed-sample-code-ignore-below
export { a, b };
export type { T };
