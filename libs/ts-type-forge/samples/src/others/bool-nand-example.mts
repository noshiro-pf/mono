import { type BoolNand } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T_T = BoolNand<true, true>; // false
type T_F = BoolNand<true, false>; // true
type F_T = BoolNand<false, true>; // true
type F_F = BoolNand<false, false>; // true

// embed-sample-code-ignore-below
export type { F_F, F_T, T_F, T_T };
