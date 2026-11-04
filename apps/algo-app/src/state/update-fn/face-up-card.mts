import type { Card, GameState } from '../../types/index.mjs';
import { setVisibility } from './set-visibility.mjs';

export const faceUpCard = (
  state: GameState,
  target: Card | undefined,
): GameState => setVisibility(state, target, 'everyone');
