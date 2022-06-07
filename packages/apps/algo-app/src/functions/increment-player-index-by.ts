import type { PlayerIndex } from '../types';

export const incrementPlayerIndex = (
  index: PlayerIndex,
  by: 0 | 1 | 2 | 3
): PlayerIndex => ((index + by) % 4) as PlayerIndex;

export const decrementPlayerIndex = (
  index: PlayerIndex,
  by: 0 | 1 | 2 | 3
): PlayerIndex => ((4 + index - by) % 4) as PlayerIndex;
