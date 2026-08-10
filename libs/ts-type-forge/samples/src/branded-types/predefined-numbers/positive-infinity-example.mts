import { type FiniteNumber, type POSITIVE_INFINITY } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPosInfinity = (x: number): x is POSITIVE_INFINITY =>
  x === Number.POSITIVE_INFINITY;

const handleLimit = (x: number): FiniteNumber | POSITIVE_INFINITY => {
  if (x > Number.MAX_VALUE)
    return Number.POSITIVE_INFINITY as POSITIVE_INFINITY;
  return x as FiniteNumber;
};

// embed-sample-code-ignore-below
export { handleLimit, isPosInfinity };
