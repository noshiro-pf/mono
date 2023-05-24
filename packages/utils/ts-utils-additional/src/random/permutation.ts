import { Arr } from '@noshiro/ts-utils';
import { getShuffled } from '../array';

export function permutation(n: SmallUint): readonly SmallUint[];
export function permutation(n: SafeUint): readonly SafeUint[];
export function permutation(n: SafeUint): readonly SafeUint[] {
  return getShuffled(Arr.seq(n));
}
