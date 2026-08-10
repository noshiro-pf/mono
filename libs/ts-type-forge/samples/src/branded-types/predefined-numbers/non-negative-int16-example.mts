import { type NonNegativeInt16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonNegativeInt16 = (x: number): x is NonNegativeInt16 =>
  Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 15 - 1;

const altitude = (meters: NonNegativeInt16) => ({ altitude: meters });

// embed-sample-code-ignore-below
export { altitude, isNonNegativeInt16 };
