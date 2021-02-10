import { DataForCardEffect } from './data-for-card-effect';
import { faceUp, faceDown, determinatePhaseOf, indeterminatePhaseOf } from '../shortcut';
import { utils } from '../../../../../../mylib/utilities';


export const forAllPlayers
  = ( async: boolean,
      operation: ((data: DataForCardEffect, playerId: number) => any),
      data: DataForCardEffect,
) => {
  if ( async ) {
    return Promise.all(
      utils.number.seq0( data.gameState.numberOfPlayers )
        .map( i => operation( data, i ) ) );
  } else {
    for ( let i = 0; i < data.gameState.numberOfPlayers; ++i ) {
      operation( data, i );
    }
  }
};

export const forAllOtherPlayers
  = ( async: boolean,
      playerId: number,
      operation: ((data: DataForCardEffect, playerId: number) => any),
      data: DataForCardEffect,
) => {
  if ( async ) {
    return Promise.all(
      utils.number.seq0( data.gameState.numberOfPlayers )
        .filter( i => i !== playerId )
        .map( i => operation( data, i ) ) );
  } else {
    for ( let i = 0; i < data.gameState.numberOfPlayers; ++i ) {
      if ( i === playerId ) continue;
      operation( data, i );
    }
  }
};

export const incrementVcoin = ( playerId: number,
  data: DataForCardEffect
) => {
  data.gameState.allPlayersData[ playerId ].vcoin++;
};

export const revealHandCards = async ( playerId: number, sec: number,
  data: DataForCardEffect
) => {
  const handCards = data.gameState.DCards.allPlayersCards[ playerId ].HandCards;
  data.messager(`${handCards.map( d => d.cardProperty.nameJp ).join('、')}を公開しました。`);
  faceUp( handCards );
  await utils.asyncOperation.sleep(sec);
  faceDown( handCards );
  faceUp( handCards, playerId );
};



export const goToIndeterminatePhase = ( data: DataForCardEffect ) => {
  data.gameState.turnInfo.phase = indeterminatePhaseOf( data.gameState.turnInfo.phase );
  data.gameStateSetter( data.gameState );
};

export const goToDeterminatePhase = ( data: DataForCardEffect ) => {
  data.gameState.turnInfo.phase = determinatePhaseOf( data.gameState.turnInfo.phase );
  data.gameStateSetter( data.gameState );
};

