import { type Index } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Idx3 = Index<3>; // 0 | 1 | 2
type Idx0 = Index<0>; // never
type Idx1 = Index<1>; // 0

// embed-sample-code-ignore-below
export type { Idx0, Idx1, Idx3 };
