import { type MutableFixedLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type MutableTupleOf2Booleans = MutableFixedLengthTuple<2, boolean>; // [boolean, boolean]

// embed-sample-code-ignore-below
export type { MutableTupleOf2Booleans };
