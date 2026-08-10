import { type BigInt64 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const toBigInt64 = (x: bigint): BigInt64 => {
  const min = -(2n ** 63n);
  const max = 2n ** 63n - 1n;
  if (x >= min && x <= max) return x as BigInt64;
  throw new Error('Out of BigInt64 range');
};

// embed-sample-code-ignore-below
export { toBigInt64 };
