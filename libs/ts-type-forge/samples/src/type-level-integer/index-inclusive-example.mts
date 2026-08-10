import { type IndexInclusive } from 'ts-type-forge';

// embed-sample-code-ignore-above

type IdxInc3 = IndexInclusive<3>; // 0 | 1 | 2 | 3
type IdxInc0 = IndexInclusive<0>; // 0

// embed-sample-code-ignore-below
export type { IdxInc0, IdxInc3 };
