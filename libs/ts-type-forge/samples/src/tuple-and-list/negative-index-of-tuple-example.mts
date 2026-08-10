import { type NegativeIndexOfTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TupleNegativeIndices = NegativeIndexOfTuple<[string, boolean, number]>; // -1 | -2 | -3
type ArrayNegativeIndices = NegativeIndexOfTuple<string[]>; // number
type EmptyTupleNegativeIndices = NegativeIndexOfTuple<[]>; // never
type ReadonlyArrayNegativeIndices = NegativeIndexOfTuple<readonly number[]>; // number

// embed-sample-code-ignore-below
export type {
  ArrayNegativeIndices,
  EmptyTupleNegativeIndices,
  ReadonlyArrayNegativeIndices,
  TupleNegativeIndices,
};
