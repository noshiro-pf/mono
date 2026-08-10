import { type IsNotFixedLengthList } from 'ts-type-forge';

// embed-sample-code-ignore-above

type IsNotTuple = IsNotFixedLengthList<readonly [1, 2, 3]>; // false
type IsNotArray = IsNotFixedLengthList<readonly number[]>; // true
type IsNotReadonlyArray = IsNotFixedLengthList<readonly string[]>; // true
type IsNotEmptyTuple = IsNotFixedLengthList<readonly []>; // false
type IsNotTupleWithRest = IsNotFixedLengthList<readonly [number, ...string[]]>; // true

// embed-sample-code-ignore-below
export type {
  IsNotArray,
  IsNotEmptyTuple,
  IsNotReadonlyArray,
  IsNotTuple,
  IsNotTupleWithRest,
};
