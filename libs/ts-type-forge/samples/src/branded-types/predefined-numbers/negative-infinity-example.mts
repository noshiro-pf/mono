import { type FiniteNumber, type NEGATIVE_INFINITY } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegInfinity = (x: number): x is NEGATIVE_INFINITY =>
  x === Number.NEGATIVE_INFINITY;

const handleUnderflow = (x: number): FiniteNumber | NEGATIVE_INFINITY =>
  x < -Number.MAX_VALUE
    ? (Number.NEGATIVE_INFINITY as NEGATIVE_INFINITY)
    : (x as FiniteNumber);

// embed-sample-code-ignore-below
export { handleUnderflow, isNegInfinity };
