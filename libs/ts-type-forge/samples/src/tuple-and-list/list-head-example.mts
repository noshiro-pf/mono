import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type H1 = List.Head<readonly [1, 2, 3]>; // 1
type H2 = List.Head<readonly string[]>; // string
type H3 = List.Head<readonly []>; // never
type H4 = List.Head<readonly [], 'default'>; // 'default'

// embed-sample-code-ignore-below
export type { H1, H2, H3, H4 };
