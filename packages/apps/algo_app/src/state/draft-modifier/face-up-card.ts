import type { WritableDraft } from 'immer/dist/internal';
import { cardEq } from '../../functions';
import type { Card, GameState } from '../../types';

export const faceUpCard = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  draft: WritableDraft<GameState>,
  target: Card | undefined
): void => {
  for (const cards of draft.playerCards) {
    for (const c of cards) {
      if (cardEq(c, target)) {
        c.visibleTo = 'everyone';
      }
    }
  }
};
