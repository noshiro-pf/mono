import { type BigUint64 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const toBigUint64 = (x: bigint): BigUint64 => {
  const max = 2n ** 64n - 1n;
  if (x >= 0n && x <= max) return x as BigUint64;
  throw new Error('Out of BigUint64 range');
};

// embed-sample-code-ignore-below
export { toBigUint64 };
