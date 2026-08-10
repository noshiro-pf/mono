import { type MutableBoundedLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T = MutableBoundedLengthTuple<1, 2, number>; // [number] | [number, number]

// embed-sample-code-ignore-below
export type { T };
