import { type BoolNeq } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T_T = BoolNeq<true, true>; // false
type T_F = BoolNeq<true, false>; // true
type F_T = BoolNeq<false, true>; // true
type F_F = BoolNeq<false, false>; // false

// embed-sample-code-ignore-below
export type { F_F, F_T, T_F, T_T };
