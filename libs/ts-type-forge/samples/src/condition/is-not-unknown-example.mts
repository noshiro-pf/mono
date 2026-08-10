import { type IsNotUnknown } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = IsNotUnknown<unknown>; // false
type T2 = IsNotUnknown<any>; // true
type T3 = IsNotUnknown<string>; // true

// embed-sample-code-ignore-below
export type { T1, T2, T3 };
