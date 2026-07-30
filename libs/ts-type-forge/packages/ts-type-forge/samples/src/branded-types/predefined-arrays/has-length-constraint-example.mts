import { type HasLengthConstraint, type MinLengthArray } from 'ts-type-forge';

// embed-sample-code-ignore-above

type A = HasLengthConstraint<MinLengthArray<3, string>>; // true
type B = HasLengthConstraint<readonly [string, string]>; // false
type C = HasLengthConstraint<readonly string[]>; // false

// embed-sample-code-ignore-below
export type { A, B, C };
