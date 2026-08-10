import { type IsAny } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = IsAny<any>; // true
type T2 = IsAny<unknown>; // false
type T3 = IsAny<never>; // false
type T4 = IsAny<string>; // false
type T5 = IsAny<string | any>; // true (`any` absorbs the union)

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4, T5 };
