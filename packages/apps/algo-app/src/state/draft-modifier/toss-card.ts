import type { WritableDraft } from 'immer/dist/internal';
import { cardEq } from '../../functions';
import type { Card, GameState } from '../../types';

export const tossCard = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  draft: WritableDraft<GameState>,
  target: Card | undefined
): void => {
  for (const mut_cards of draft.playerCards) {
    for (const mut_c of mut_cards) {
      if (cardEq(mut_c, target)) {
        mut_c.visibleTo = 'pair';
      }
    }
  }
};
