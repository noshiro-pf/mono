import { utils } from '../../../../../../mylib/utilities';
import { DCard } from '../../../../types/dcard';
import * as cs from './card-effect-shortcut';
import { DataForCardEffect } from './data-for-card-effect';

/* 93. 賢者の石 */
export const Philosophers_Stone = async (
  thisDcard: DCard,
  pid: number,
  data: DataForCardEffect,
) => {
  const playersCard = data.gameState.DCards.allPlayersCards[pid];
  const DeckSize = playersCard.Deck.length;
  const DiscardPileSize = playersCard.DiscardPile.length;
  const coin = utils.number.divint(DeckSize + DiscardPileSize, 5);

  data.messager(
    `${data.playersNameList[pid]}の` +
      `山札は${DeckSize}枚・捨て札置き場の枚数は${DiscardPileSize}枚` +
      `だったので、${coin}コインを得ます。`,
  );

  data.gameState.turnInfo.coin += coin;
  data.gameStateSetter(data.gameState);

  cs.goToDeterminatePhase(data);
};
