import { type IsUnknown } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = IsUnknown<unknown>; // true
type T2 = IsUnknown<any>; // false
type T3 = IsUnknown<never>; // false
type T4 = IsUnknown<string>; // false
type T5 = IsUnknown<string | unknown>; // true (`unknown` absorbs the union)

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4, T5 };
