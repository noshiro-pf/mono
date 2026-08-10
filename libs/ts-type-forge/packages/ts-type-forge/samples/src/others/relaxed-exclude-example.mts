import { type RelaxedExclude } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Union = 'a' | 'b' | 'c';
type Remaining = RelaxedExclude<Union, 'a' | 'd'>; // 'b' | 'c'
type NonStrings = RelaxedExclude<string | number | boolean, string>; // number | boolean

// embed-sample-code-ignore-below
export type { NonStrings, Remaining, Union };
