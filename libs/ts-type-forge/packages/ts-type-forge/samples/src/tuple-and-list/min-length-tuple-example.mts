import { type MinLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type AtLeast3Strings = MinLengthTuple<3, string>; // readonly [string, string, string, ...string[]]
const valid: AtLeast3Strings = ['a', 'b', 'c'];
const alsoValid: AtLeast3Strings = ['a', 'b', 'c', 'd'];
// const invalid: AtLeast3Strings = ["a", "b"]; // Error

// embed-sample-code-ignore-below
export { alsoValid, valid };
export type { AtLeast3Strings };
