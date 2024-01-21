import { cardEq } from '../../functions';
import { type Card, type GameState } from '../../types';

export const faceUpCard = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  draft: DeepWritable<GameState>,
  target: Card | undefined,
): void => {
  for (const mut_cards of draft.playerCards) {
    for (const mut_c of mut_cards) {
      if (cardEq(mut_c, target)) {
        mut_c.visibleTo = 'everyone';
      }
    }
  }
};
