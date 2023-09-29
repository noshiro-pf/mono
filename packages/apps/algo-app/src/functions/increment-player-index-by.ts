import { toPlayerIndex, type PlayerIndex } from '../types';

export const incrementPlayerIndex = (
  index: PlayerIndex,
  by: 0 | 1 | 2 | 3
): PlayerIndex => toPlayerIndex((index + by) % 4);

export const decrementPlayerIndex = (
  index: PlayerIndex,
  by: 0 | 1 | 2 | 3
): PlayerIndex => toPlayerIndex((4 + index - by) % 4);
