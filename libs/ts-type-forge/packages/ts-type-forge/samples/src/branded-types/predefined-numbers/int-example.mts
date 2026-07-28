import { type Int, type NonNegativeNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isInt = (x: number): x is Int => Number.isInteger(x);

const getArrayElement = <T,>(
  arr: readonly T[],
  index: Int & NonNegativeNumber,
) => arr[index];

const factorial = (n: Int & NonNegativeNumber): Int =>
  n === 0
    ? (1 as Int)
    : ((n * factorial((n - 1) as Int & NonNegativeNumber)) as Int);

// embed-sample-code-ignore-below
export { factorial, getArrayElement, isInt };
