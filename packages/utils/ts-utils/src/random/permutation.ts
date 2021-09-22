import { getShuffled } from '../array';
import { IList } from '../immutable';

export const permutation = (n: number): readonly number[] =>
  getShuffled(IList.seqThrow(n));
