import { type MaxLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type AtMost2Numbers = MaxLengthTuple<2, number>;
// readonly [] | readonly [number] | readonly [number, number]
const valid: AtMost2Numbers = []; // ok
const alsoValid: AtMost2Numbers = [1, 2]; // ok
// const invalid: AtMost2Numbers = [1, 2, 3]; // Error

// embed-sample-code-ignore-below
export { alsoValid, valid };
export type { AtMost2Numbers };
