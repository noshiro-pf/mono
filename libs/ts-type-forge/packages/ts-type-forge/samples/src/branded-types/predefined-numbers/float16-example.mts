import { type Float16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const toFloat16 = (x: number): Float16 => {
  const arr = new Float16Array([x]);
  return arr[0] as Float16;
};

const halfPrecisionData = (_values: readonly Float16[]): void => {
  // Half-precision computations
};

// embed-sample-code-ignore-below
export { halfPrecisionData, toFloat16 };
