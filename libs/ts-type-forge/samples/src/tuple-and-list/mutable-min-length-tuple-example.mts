import { type MutableMinLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type AtLeast2Numbers = MutableMinLengthTuple<2, number>; // [number, number, ...number[]]
const valid: AtLeast2Numbers = [1, 2] as const;
const alsoValid: AtLeast2Numbers = [1, 2, 3, 4] as const;
// const invalid: AtLeast2Numbers = [1]; // Error

// embed-sample-code-ignore-below
export { alsoValid, valid };
export type { AtLeast2Numbers };
