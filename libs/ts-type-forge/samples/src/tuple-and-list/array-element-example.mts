import { type ArrayElement } from 'ts-type-forge';

// embed-sample-code-ignore-above

type StrElm = ArrayElement<string[]>; // string
type NumElm = ArrayElement<readonly number[]>; // number
type TupleElm = ArrayElement<[string, boolean]>; // string | boolean
type NotArray = ArrayElement<{ a: number }>; // never

// embed-sample-code-ignore-below
export type { NotArray, NumElm, StrElm, TupleElm };
