import { type MutableNonEmptyTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NA = MutableNonEmptyTuple<string>; // [string, ...string[]]
const valid: NA = ['hello'] as const;
const alsoValid: NA = ['hello', 'world'] as const;
// const invalid: NA = []; // Error

// embed-sample-code-ignore-below
export { alsoValid, valid };
export type { NA };
