import { Arr } from '@noshiro/ts-utils';
import { getShuffled } from '../array';

type SmallUint = Uint9;

export function permutation(n: SmallUint): readonly SmallUint[];
export function permutation(n: Uint32): readonly Uint32[];
export function permutation(
  n: SmallUint | Uint32
): readonly SmallUint[] | readonly Uint32[] {
  return getShuffled(Arr.seq(n as Uint32));
}
