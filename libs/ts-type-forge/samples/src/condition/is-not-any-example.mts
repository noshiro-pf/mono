import { type IsNotAny } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = IsNotAny<any>; // false
type T2 = IsNotAny<unknown>; // true
type T3 = IsNotAny<string>; // true

// embed-sample-code-ignore-below
export type { T1, T2, T3 };
