import { type FiniteNumber, type NEGATIVE_INFINITY } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegInfinity = (x: number): x is NEGATIVE_INFINITY =>
  x === Number.NEGATIVE_INFINITY;

const handleUnderflow = (x: number): FiniteNumber | NEGATIVE_INFINITY => {
  if (x < -Number.MAX_VALUE)
    return Number.NEGATIVE_INFINITY as NEGATIVE_INFINITY;
  return x as FiniteNumber;
};

// embed-sample-code-ignore-below
export { handleUnderflow, isNegInfinity };
