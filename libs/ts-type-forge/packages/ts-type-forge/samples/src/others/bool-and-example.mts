import { type BoolAnd } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T_T = BoolAnd<true, true>; // true
type T_F = BoolAnd<true, false>; // false
type F_T = BoolAnd<false, true>; // false
type F_F = BoolAnd<false, false>; // false

// Useful for combining conditions
type HasBothFlags<T> = T extends { flagA: infer A; flagB: infer B }
  ? A extends boolean
    ? B extends boolean
      ? BoolAnd<A, B>
      : false
    : false
  : false;

// embed-sample-code-ignore-below
export type { F_F, F_T, HasBothFlags, T_F, T_T };
