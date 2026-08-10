import { type MutableMaxLengthTuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type AtMost2Numbers = MutableMaxLengthTuple<2, number>; // [] | [number] | [number, number]

// embed-sample-code-ignore-below
export type { AtMost2Numbers };
