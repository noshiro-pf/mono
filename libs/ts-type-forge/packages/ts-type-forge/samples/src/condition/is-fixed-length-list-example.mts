import { type IsFixedLengthList } from 'ts-type-forge';

// embed-sample-code-ignore-above

type IsTuple = IsFixedLengthList<[1, 2, 3]>; // true
type IsArray = IsFixedLengthList<number[]>; // false
type IsReadonlyArray = IsFixedLengthList<readonly string[]>; // false
type IsEmptyTuple = IsFixedLengthList<[]>; // true
type IsTupleWithRest = IsFixedLengthList<[number, ...string[]]>; // false

// embed-sample-code-ignore-below
export type {
  IsArray,
  IsEmptyTuple,
  IsReadonlyArray,
  IsTuple,
  IsTupleWithRest,
};
