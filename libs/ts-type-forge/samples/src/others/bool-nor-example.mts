import { type BoolNor } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T_T = BoolNor<true, true>; // false
type T_F = BoolNor<true, false>; // false
type F_T = BoolNor<false, true>; // false
type F_F = BoolNor<false, false>; // true

// embed-sample-code-ignore-below
export type { F_F, F_T, T_F, T_T };
