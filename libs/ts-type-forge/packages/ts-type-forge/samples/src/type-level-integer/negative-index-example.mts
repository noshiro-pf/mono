import { type NegativeIndex } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NegIdx3 = NegativeIndex<3>; // -1 | -2 | -3
type NegIdx0 = NegativeIndex<0>; // never
type NegIdx1 = NegativeIndex<1>; // -1

// embed-sample-code-ignore-below
export type { NegIdx0, NegIdx1, NegIdx3 };
