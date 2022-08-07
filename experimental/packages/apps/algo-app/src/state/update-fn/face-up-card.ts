import { cardEq } from '../../functions';
import { type Card, type GameState } from '../../types';

export const faceUpCard = (
  state: GameState,
  target: Card | undefined,
): GameState =>
  Obj.update(state, 'playerCards', (playerCards) =>
    Tpl.map(playerCards, (cards) =>
      Tpl.map(cards, (c) =>
        cardEq(c, target) ? Obj.set(c, 'visibleTo', 'everyone') : c,
      ),
    ),
  );
