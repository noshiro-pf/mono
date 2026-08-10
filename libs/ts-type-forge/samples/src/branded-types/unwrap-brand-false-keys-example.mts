import { type Brand, type UnwrapBrandFalseKeys } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NonZeroInt = Brand<number, 'integer', 'zero'>;
type FalseKeys = UnwrapBrandFalseKeys<NonZeroInt>; // 'zero'

// embed-sample-code-ignore-below
export type { FalseKeys, NonZeroInt };
