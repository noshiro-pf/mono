import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

type PermutationImpl<U, K = U> = [U] extends [never]
  ? []
  : K extends unknown
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    [K, ...PermutationImpl<Exclude<U, K>>]
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
