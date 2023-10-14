import { utils } from '../../../../../../mylib/utilities';
import { DCard } from '../../../../types/dcard';
import { drawCards } from '../shortcut';
import * as cs from './card-effect-shortcut';
import { DataForCardEffect } from './data-for-card-effect';

/* 139. 移動動物園 */
export const Menagerie = async (
  thisDcard: DCard,
  pid: number,
  data: DataForCardEffect,
) => {
  await cs.revealHandCards(pid, 2, data);
  const handCards = data.gameState.DCards.allPlayersCards[pid].HandCards;
  const handCardsUniq = utils.array.uniq(
    handCards,
    (d: DCard) => d.cardProperty.cardId,
  );

  if (handCards.length === handCardsUniq.length) {
    data.messager('重複しているカードがないのでカードを3枚引きます。');
    await drawCards(3, pid, data, false);
  } else {
    data.messager('重複しているカードがあるのでカードを1枚引きます。');
    await drawCards(1, pid, data, false);
  }

  cs.goToDeterminatePhase(data);
};
