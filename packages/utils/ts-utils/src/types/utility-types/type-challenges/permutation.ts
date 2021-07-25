import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

type PermutationImpl<U, V = U> = [U] extends [never]
  ? []
  : V extends V
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    [V, ...PermutationImpl<Exclude<U, V>>]
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
