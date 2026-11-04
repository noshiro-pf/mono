import type { Card, GameState } from '../../types/index.mjs';
import { setVisibility } from './set-visibility.mjs';

export const tossCard = (
  state: GameState,
  target: Card | undefined,
): GameState => setVisibility(state, target, 'pair');
