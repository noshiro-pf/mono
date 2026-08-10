import { type FiniteNumber, type InfiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isFiniteNumber = (x: number): x is FiniteNumber => Number.isFinite(x);

const safeDivide = (
  a: FiniteNumber,
  b: FiniteNumber,
): FiniteNumber | InfiniteNumber => {
  const result = a / b;
  return isFiniteNumber(result) ? result : (result as InfiniteNumber);
};

// embed-sample-code-ignore-below
export { isFiniteNumber, safeDivide };
