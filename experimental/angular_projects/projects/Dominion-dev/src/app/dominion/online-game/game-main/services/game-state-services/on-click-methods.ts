import { isBasicTreasure } from '../../../../functions/is-basic-treasure';
import { getCardEffect } from './card-effect';
import { DataForCardEffect } from './card-effect-definitions/data-for-card-effect';
import { buyCard, playCard } from './shortcut';

export const playAllTreasures = async (
  playerId: number,
  showMessage: boolean,
  data: DataForCardEffect,
) => {
  const basicTreasures = data.gameState.DCards.allPlayersCards[
    playerId
  ].HandCards.filter((d) => isBasicTreasure(d.cardProperty.cardId));

  if (showMessage) {
    const name = basicTreasures.map((e) => e.cardProperty.nameJp).join('、');
    data.messager(
      `${data.playersNameList[playerId]}が（${name}）をプレイしました。`,
    );
  }

  for (const dcard of basicTreasures) {
    playCard(dcard, playerId, data, false);
    await getCardEffect(dcard, playerId, data);
  }
};

export const onVcoinClick = (
  playerId: number,
  showMessage: boolean,
  data: DataForCardEffect,
) => {
  data.gameState.turnInfo.coin++;
  data.gameState.allPlayersData[playerId].vcoin--;
  if (showMessage) {
    data.messager(
      `${data.playersNameList[playerId]}が仮想コインを使用しました。`,
    );
  }
  data.gameStateSetter(data.gameState);
};

export const onDebtClick = (
  playerId: number,
  showMessage: boolean,
  data: DataForCardEffect,
) => {
  // todo
};

export const onCardClick = async (
  clickedCardId: number,
  playerId: number,
  data: DataForCardEffect,
) => {
  const clickedCard = data.gameState.getDCard(clickedCardId);
  const dir = data.gameState.getDirectory(clickedCardId);

  switch (data.gameState.turnInfo.phase) {
    case 'Action': // アクションカードの通常の使用
      playCard(clickedCard, playerId, data, true);
      await getCardEffect(clickedCard, playerId, data);
      data.gameState.turnInfo.action -= 1;
      break;

    case '<Action>':
      // アクションカードの通常以外の使用，選択したカードの獲得
      break;

    case 'BuyPlay':
      if (
        dir[0] === 'allPlayersCards' &&
        dir[1] === playerId &&
        dir[2] === 'HandCards'
      ) {
        // 財宝カードの通常の使用
        playCard(clickedCard, playerId, data, true);
        await getCardEffect(clickedCard, playerId, data);
      }
      if (dir[0] === 'BasicCards' || dir[0] === 'KingdomCards') {
        // カードの購入
        data.gameState.turnInfo.phase = 'BuyCard';
        buyCard(clickedCard, playerId, data, true);
      }
      break;

    case '<BuyPlay>': // 財宝カードの通常以外の使用
      break;

    case 'BuyCard': // サプライなどからのカードの購入
      buyCard(clickedCard, playerId, data, true);
      break;

    case 'Night': // Nightカードの使用
      playCard(clickedCard, playerId, data, true);
      await getCardEffect(clickedCard, playerId, data);
      break;

    default:
      break;
  }
};
