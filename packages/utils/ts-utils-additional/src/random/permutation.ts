import { Arr, toSafeUint } from '@noshiro/ts-utils';
import { getShuffled } from '../array';

type SmallUint = Uint9;

export function permutation(n: SmallUint): readonly SmallUint[];
export function permutation(n: SafeUint): readonly SafeUint[];
export function permutation(
  n: SafeUint | SmallUint
): readonly SafeUint[] | readonly SmallUint[] {
  return getShuffled(Arr.seq(toSafeUint(n)));
}
