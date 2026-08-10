import { type BoolEq } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T_T = BoolEq<true, true>; // true
type T_F = BoolEq<true, false>; // false
type F_T = BoolEq<false, true>; // false
type F_F = BoolEq<false, false>; // true

// embed-sample-code-ignore-below
export type { F_F, F_T, T_F, T_T };
