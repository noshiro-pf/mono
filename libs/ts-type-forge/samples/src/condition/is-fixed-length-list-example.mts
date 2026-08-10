import { type IsFixedLengthList } from 'ts-type-forge';

// embed-sample-code-ignore-above

type IsTuple = IsFixedLengthList<readonly [1, 2, 3]>; // true
type IsArray = IsFixedLengthList<readonly number[]>; // false
type IsReadonlyArray = IsFixedLengthList<readonly string[]>; // false
type IsEmptyTuple = IsFixedLengthList<readonly []>; // true
type IsTupleWithRest = IsFixedLengthList<readonly [number, ...string[]]>; // false

// embed-sample-code-ignore-below
export type {
  IsArray,
  IsEmptyTuple,
  IsReadonlyArray,
  IsTuple,
  IsTupleWithRest,
};
