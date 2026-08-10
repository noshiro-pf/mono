import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type H1 = Tuple.Head<[1, 2, 3]>; // 1
type H2 = Tuple.Head<[]>; // never
type H3 = Tuple.Head<[], 'default'>; // 'default'
type H4 = Tuple.Head<readonly string[]>; // string

// embed-sample-code-ignore-below
export type { H1, H2, H3, H4 };
