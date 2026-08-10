import { type Length } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TupleLen = Length<[1, 2, 3]>; // 3
type ArrayLen = Length<string[]>; // number

// Note: a string literal's `length` property is typed as `number`,
// not as the literal length of the string.
type StringLen = Length<'abc'>; // number

// embed-sample-code-ignore-below
export type { ArrayLen, StringLen, TupleLen };
