import { DCard } from '../../../types/dcard';
import { DataForCardEffect } from './card-effect-definitions/data-for-card-effect';
import { drawCards, indeterminatePhaseOf, determinatePhaseOf } from './shortcut';

import * as Original from './card-effect-definitions/01_Original';
import * as Intrigue from './card-effect-definitions/02_Intrigue';
// import * as Seaside from './card-effect-definitions/03_Seaside';
import * as Alchemy from './card-effect-definitions/04_Alchemy';
import * as Prosperity from './card-effect-definitions/05_Prosperity';
import * as Cornucopia from './card-effect-definitions/06_Cornucopia';
// import * as Hinterlands from './card-effect-definitions/07_Hinterlands';
// import * as Dark_Ages from './card-effect-definitions/08_Dark_Ages';
import * as Guild from './card-effect-definitions/09_Guild';
import * as cs from './card-effect-definitions/card-effect-shortcut';
// import * as Adventures from './card-effect-definitions/10_Adventures';
// import * as Empires from './card-effect-definitions/11_Empires';
// import * as Nocturne from './card-effect-definitions/12_Nocturne';




export const getCardEffect = async ( dcard: DCard, pid: number,
  data: DataForCardEffect
) => {
  const cardProp = dcard.cardProperty;
  data.gameState.turnInfo.action += cardProp.action;
  data.gameState.turnInfo.buy    += cardProp.buy;
  data.gameState.turnInfo.coin   += cardProp.coin;
  if ( cardProp.cardId === 'Potion' ) data.gameState.turnInfo.potion++;
  data.gameState.allPlayersData[ pid ].VPtoken += cardProp.VPtoken;
  data.gameStateSetter( data.gameState );
  await drawCards( cardProp.drawCard, pid, data, true );

  await getAdditionalEffect( dcard, pid, data );
};



const getAdditionalEffect = async ( dcard: DCard, pid: number,
  data: DataForCardEffect
) => {
  cs.goToIndeterminatePhase( data );

  switch ( dcard.cardProperty.cardId ) {
    case 'Council_Room':       await Original.Council_Room     ( dcard, pid, data ); break;
    // case 'Throne_Room':        await Original.Throne_Room      ( dcard, playerId, data, getCardEffect ); break;
    case 'Shanty_Town':        await Intrigue.Shanty_Town      ( dcard, pid, data ); break;
    case 'Philosophers_Stone': await Alchemy.Philosophers_Stone( dcard, pid, data ); break;
    case 'Menagerie':          await Cornucopia.Menagerie      ( dcard, pid, data ); break;
    case 'Baker':              await Guild.Baker               ( dcard, pid, data ); break;
    case 'Candlestick_Maker':  await Guild.Candlestick_Maker   ( dcard, pid, data ); break;
    case 'Bank':               await Prosperity.Bank           ( dcard, pid, data ); break;
    default :
      cs.goToDeterminatePhase( data );
      break;
  }

};
