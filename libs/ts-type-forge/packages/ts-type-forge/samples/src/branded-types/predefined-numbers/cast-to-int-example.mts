import { type FiniteNumber, type Int } from 'ts-type-forge';

// Local copy of the internal (non-exported) `CastToInt` helper.
type CastToInt<T> = T extends Int ? T : never;

// embed-sample-code-ignore-above

type A = CastToInt<Int>; // Int
type B = CastToInt<FiniteNumber>; // never

// embed-sample-code-ignore-below
export type { A, B };
