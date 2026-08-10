import { type IsNotFixedLengthList } from 'ts-type-forge';

// embed-sample-code-ignore-above

type IsNotTuple = IsNotFixedLengthList<[1, 2, 3]>; // false
type IsNotArray = IsNotFixedLengthList<number[]>; // true
type IsNotReadonlyArray = IsNotFixedLengthList<readonly string[]>; // true
type IsNotEmptyTuple = IsNotFixedLengthList<[]>; // false
type IsNotTupleWithRest = IsNotFixedLengthList<[number, ...string[]]>; // true

// embed-sample-code-ignore-below
export type {
  IsNotArray,
  IsNotEmptyTuple,
  IsNotReadonlyArray,
  IsNotTuple,
  IsNotTupleWithRest,
};
