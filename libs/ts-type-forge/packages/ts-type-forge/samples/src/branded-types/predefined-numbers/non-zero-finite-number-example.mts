import { type FiniteNumber, type NonZeroFiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroFinite = (x: number): x is NonZeroFiniteNumber =>
  Number.isFinite(x) && x !== 0;

const rate = (distance: FiniteNumber, time: NonZeroFiniteNumber) =>
  distance / time; // Safe division, finite result

// embed-sample-code-ignore-below
export { isNonZeroFinite, rate };
