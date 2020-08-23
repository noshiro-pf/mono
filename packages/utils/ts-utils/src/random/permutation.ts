import { getShuffled, seq } from '../array';

export const permutation = (n: number): number[] => getShuffled(seq(n));
