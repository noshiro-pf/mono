import { type IsUnion } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = IsUnion<string | number>; // true
type T2 = IsUnion<string>; // false
type T3 = IsUnion<string>; // false (simplifies to string)
type T4 = IsUnion<never>; // false
type T5 = IsUnion<any>; // false
type T6 = IsUnion<unknown>; // false
type T7 = IsUnion<true | false>; // true (boolean)
type T8 = IsUnion<boolean>; // true (equivalent to true | false)

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4, T5, T6, T7, T8 };
