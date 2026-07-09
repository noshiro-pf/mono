import { type NonZeroUint16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroUint16 = (x: number): x is NonZeroUint16 =>
  Number.isSafeInteger(x) && x > 0 && x <= 2 ** 16 - 1;

const networkId = (id: NonZeroUint16) => ({ networkId: id });

// embed-sample-code-ignore-below
export { isNonZeroUint16, networkId };
