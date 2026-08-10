import { type IsNever } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = IsNever<never>; // true
type T2 = IsNever<string>; // false
type T3 = IsNever<any>; // false
type T4 = IsNever<unknown>; // false
type T5 = IsNever<string | never>; // false (evaluates to string)
type T6 = IsNever<string & never>; // true (evaluates to never)

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4, T5, T6 };
