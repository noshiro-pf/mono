import type { IndexOfTuple } from './index-of-tuple';
import type { MakeTuple } from './make-tuple';

export type Seq<N extends number> = IndexOfTuple<MakeTuple<unknown, N>>;
