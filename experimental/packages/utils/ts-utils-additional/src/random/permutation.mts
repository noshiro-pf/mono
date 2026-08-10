import { Arr, toUint32 } from '@noshiro/ts-utils';
import { getShuffled } from '../array/index.mjs';

export function permutation<N extends SmallUint>(
  n: N,
): ArrayOfLength<N, SmallUint>;
export function permutation(
  n: NumberType.ArraySize,
): readonly NumberType.ArraySize[];
export function permutation(
  n: NumberType.ArraySizeArgNonNegative,
): readonly NumberType.ArraySize[] {
  return getShuffled(Arr.seq(toUint32(n)));
}
