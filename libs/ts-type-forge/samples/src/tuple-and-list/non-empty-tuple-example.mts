import { type NonEmptyTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NA = NonEmptyTuple<number>; // readonly [number, ...number[]]
const valid: NA = [1];
const alsoValid: NA = [1, 2, 3];
// const invalid: NA = []; // Error
// valid.push(4); // Error: Property 'push' does not exist on type 'readonly [number, ...number[]]'.

// embed-sample-code-ignore-below
export { alsoValid, valid };
export type { NA };
