import { type Brand, type UnwrapBrandTrueKeys } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NonZeroInt = Brand<number, 'integer', 'zero'>;
type TrueKeys = UnwrapBrandTrueKeys<NonZeroInt>; // 'integer'

// embed-sample-code-ignore-below
export type { NonZeroInt, TrueKeys };
