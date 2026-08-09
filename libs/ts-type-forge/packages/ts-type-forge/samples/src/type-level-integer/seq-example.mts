import { type Seq } from 'ts-type-forge';

// embed-sample-code-ignore-above

type S3 = Seq<3>; // readonly [0, 1, 2]
type S0 = Seq<0>; // readonly []
type S1 = Seq<1>; // readonly [0]

// embed-sample-code-ignore-below
export type { S0, S1, S3 };
