import { type IndexOfTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TupleIndices = IndexOfTuple<[string, boolean, number]>; // 0 | 1 | 2
type ArrayIndices = IndexOfTuple<string[]>; // number
type EmptyTupleIndices = IndexOfTuple<[]>; // never
type ReadonlyArrayIndices = IndexOfTuple<readonly number[]>; // number

// embed-sample-code-ignore-below
export type {
  ArrayIndices,
  EmptyTupleIndices,
  ReadonlyArrayIndices,
  TupleIndices,
};
