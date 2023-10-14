import { Arr, toSafeUint } from '@noshiro/ts-utils';
import { getShuffled } from '../array';

export function permutation<N extends SmallUint>(
  n: N,
): ArrayOfLength<N, SmallUint>;
export function permutation(n: SafeUint): readonly SafeUint[];
export function permutation(n: SafeUintWithSmallInt): readonly SafeUint[] {
  return getShuffled(Arr.seq(toSafeUint(n)));
}
