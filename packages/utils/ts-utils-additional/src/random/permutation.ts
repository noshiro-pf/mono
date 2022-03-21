import { IList } from '@noshiro/ts-utils';
import { getShuffled } from '../array';

export const permutation = (n: number): readonly number[] =>
  getShuffled(IList.seqThrow(n));
