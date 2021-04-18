import { PlayerIndex } from '../types/player-index';

export const incrementPlayerIndexBy = (
  index: PlayerIndex,
  by: 0 | 1 | 2 | 3
): PlayerIndex => ((index + by) % 4) as PlayerIndex;
