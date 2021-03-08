import { DCard } from '../../../../types/dcard';
import * as cs from './card-effect-shortcut';
import { DataForCardEffect } from './data-for-card-effect';

/* 100. 銀行 */
export const Bank = async (
  thisDcard: DCard,
  pid: number,
  data: DataForCardEffect
) => {
  const playersCard = data.gameState.DCards.allPlayersCards[pid];
  const NofTreasures = playersCard.PlayArea.filter((e) =>
    e.cardProperty.cardTypes.includes('Treasure')
  ).length;

  data.messager(
    `場に${NofTreasures}枚の財宝カードがあるので、` +
      `${NofTreasures}コインを得ます。`
  );

  data.gameState.turnInfo.coin += NofTreasures;
  data.gameStateSetter(data.gameState);

  cs.goToDeterminatePhase(data);
};
