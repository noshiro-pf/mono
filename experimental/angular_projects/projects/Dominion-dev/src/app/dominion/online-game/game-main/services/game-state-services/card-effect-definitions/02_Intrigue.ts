import { DataForCardEffect } from './data-for-card-effect';
import * as cs from './card-effect-shortcut';
import { DCard } from '../../../../types/dcard';
import { drawCards } from '../shortcut';


/* 50. 貧民街 */
export const Shanty_Town = async ( thisDcard: DCard, pid: number,
  data: DataForCardEffect
) => {
  await cs.revealHandCards( pid, 2, data );

  if ( !data.gameState.DCards.allPlayersCards[ pid ].HandCards
        .some( e => e.cardProperty.cardTypes.includes('Action') )
  ) {
    data.messager('手札にアクションカードが無いのでカードを2枚引きます。');
    await drawCards( 2, pid, data, false );
  } else {
    data.messager('手札にアクションカードがあるのでカードを引けませんでした。');
  }

  cs.goToDeterminatePhase( data );
};
