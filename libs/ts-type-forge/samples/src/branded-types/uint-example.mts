import { type Uint } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isUint = (x: number): x is Uint => Number.isInteger(x) && x >= 0;

const arrayLength = (arr: readonly unknown[]): Uint => arr.length as Uint;

const repeat = (str: string, count: Uint) => str.repeat(count);

// embed-sample-code-ignore-below
export { arrayLength, isUint, repeat };
