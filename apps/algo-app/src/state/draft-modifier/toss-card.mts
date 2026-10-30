import type { DeepMutable } from 'ts-type-forge';
import { cardEq } from '../../functions/index.mjs';
import type { Card, GameState } from '../../types/index.mjs';

export const tossCard = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_draft: DeepMutable<GameState>,
  target: Card | undefined,
): void => {
  for (const mut_cards of mut_draft.playerCards) {
    for (const mut_c of mut_cards) {
      if (cardEq(mut_c, target)) {
        mut_c.visibleTo = 'pair';
      }
    }
  }
};
