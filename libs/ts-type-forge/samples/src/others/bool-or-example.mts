import { type BoolOr } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T_T = BoolOr<true, true>; // true
type T_F = BoolOr<true, false>; // true
type F_T = BoolOr<false, true>; // true
type F_F = BoolOr<false, false>; // false

// Useful for fallback conditions
type HasAnyFlag<T> = T extends { flagA: infer A; flagB: infer B }
  ? A extends boolean
    ? B extends boolean
      ? BoolOr<A, B>
      : A
    : B extends boolean
      ? B
      : false
  : false;

// embed-sample-code-ignore-below
export type { F_F, F_T, HasAnyFlag, T_F, T_T };
