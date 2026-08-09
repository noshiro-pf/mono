import { type MakeTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TupleOf3Strings = MakeTuple<3, string>; // readonly [string, string, string]
type TupleOf0Numbers = MakeTuple<0, number>; // readonly []
// type InvalidLength = MakeTuple<-1, boolean>; // Error or unexpected result
// type InvalidLength2 = MakeTuple<1.5, boolean>; // Error or unexpected result

// embed-sample-code-ignore-below
export type { TupleOf0Numbers, TupleOf3Strings };
