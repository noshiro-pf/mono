import { assertType } from '../test-type';

type PermutationImpl<U, V extends U = U> = [U] extends [never]
  ? []
  : V extends V
  ? [V, ...PermutationImpl<StrictExclude<U, V>>]
  : never;

export type Permutation<U> = PermutationImpl<U>;

assertType<
  TypeEq<
    Permutation<'A' | 'B' | 'C'>,
    | ['A', 'B', 'C']
    | ['A', 'C', 'B']
    | ['B', 'A', 'C']
    | ['B', 'C', 'A']
    | ['C', 'A', 'B']
    | ['C', 'B', 'A']
  >
>();
