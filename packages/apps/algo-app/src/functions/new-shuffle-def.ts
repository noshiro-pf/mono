import { getShuffled } from '@noshiro/ts-utils-additional';
import { type ShuffleDef } from '../types';

export const newShuffleDef = (): ShuffleDef =>
  pipe(Arr.seq(4))
    .chain(getShuffled)
    .chain((list) => list.join('')).value as ShuffleDef;
