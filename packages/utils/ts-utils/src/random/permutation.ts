import { getShuffled } from '../array';
import { IList } from '../immutable';

export const permutation = (n: number): number[] =>
  getShuffled(IList.seqThrow(n));
