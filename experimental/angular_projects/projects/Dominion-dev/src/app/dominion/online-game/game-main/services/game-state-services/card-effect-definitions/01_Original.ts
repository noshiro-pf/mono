import { DataForCardEffect } from './data-for-card-effect';
import * as cs from './card-effect-shortcut';
import { DCard } from '../../../../types/dcard';
import { drawCards } from '../shortcut';


/* 13. 議事堂 */
export const Council_Room = async ( thisDcard: DCard, playerId: number,
  data: DataForCardEffect
) => {
  data.messager('他のプレイヤーはカードを1枚引きます。');
  await cs.forAllOtherPlayers(
      true,
      playerId,
      (d: DataForCardEffect, pid: number) => drawCards( 1, pid, data, true ),
      data );

  cs.goToDeterminatePhase( data );
};

/* 28. 玉座の間 */
export const Throne_Room = async ( thisDcard: DCard, pid: number,
  data: DataForCardEffect,
  getCardEffect: ( dcard: DCard, pid: number, data: DataForCardEffect ) => Promise<void>,
  selectedActionCard: DCard,
) => {
  const cardEffectPhase = data.gameState.turnInfo.action; // todo
  switch ( cardEffectPhase ) {
    case 0:
      data.messager('2回使用するアクションカードを選んでください。');
      // 手札のアクションカードを選択可能に
      break;

    case 1:
      await getCardEffect( selectedActionCard, pid, data );
      break;

    case 2:
      await getCardEffect( selectedActionCard, pid, data );
      cs.goToDeterminatePhase( data );
      break;
  }
};
