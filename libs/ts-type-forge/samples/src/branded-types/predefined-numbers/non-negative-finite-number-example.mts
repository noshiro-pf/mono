import { type Int, type NonNegativeFiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonNegativeFinite = (x: number): x is NonNegativeFiniteNumber =>
  Number.isFinite(x) && x >= 0;

const distance = (x: NonNegativeFiniteNumber) => ({ meters: x });
const age = (years: NonNegativeFiniteNumber & Int) => ({ years });

// embed-sample-code-ignore-below
export { age, distance, isNonNegativeFinite };
