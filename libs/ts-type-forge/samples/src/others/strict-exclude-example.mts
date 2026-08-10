import { type StrictExclude } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Union = 'a' | 'b' | 'c';
type Remaining = StrictExclude<Union, 'a' | 'b'>; // 'c'
// type Invalid = StrictExclude<Union, 'a' | 'd'>; // Error: 'd' is not assignable to Union

// embed-sample-code-ignore-below
export type { Remaining, Union };
