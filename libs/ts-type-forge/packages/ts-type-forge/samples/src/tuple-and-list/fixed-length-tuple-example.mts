import { type FixedLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TupleOf3Strings = FixedLengthTuple<3, string>; // readonly [string, string, string]
type TupleOf0Numbers = FixedLengthTuple<0, number>; // readonly []

// embed-sample-code-ignore-below
export type { TupleOf0Numbers, TupleOf3Strings };
