import { getShuffled, seq } from '../array';
import type { uint32 } from '../types';

export const permutation = (n: uint32): uint32[] => getShuffled(seq(n));
