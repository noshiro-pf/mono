import { type NonZeroNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZero = (x: number): x is NonZeroNumber => x !== 0;

const safeDivide = (a: number, b: NonZeroNumber) => a / b;
// No division by zero possible

const reciprocal = (x: NonZeroNumber) => 1 / x;

// embed-sample-code-ignore-below
export { isNonZero, reciprocal, safeDivide };
