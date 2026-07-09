import { type FiniteNumber, type InfiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isInfinite = (x: number): x is InfiniteNumber =>
  !Number.isNaN(x) && !Number.isFinite(x);

const checkOverflow = (x: number): FiniteNumber | InfiniteNumber => {
  if (isInfinite(x)) return x;
  return x as FiniteNumber;
};

// embed-sample-code-ignore-below
export { checkOverflow, isInfinite };
