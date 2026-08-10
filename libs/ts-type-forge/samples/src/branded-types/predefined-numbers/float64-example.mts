import { type Float64 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const toFloat64 = (x: number): Float64 => x as Float64;

const scientificData = (_measurements: readonly Float64[]): void => {
  // High-precision calculations
};

// embed-sample-code-ignore-below
export { scientificData, toFloat64 };
