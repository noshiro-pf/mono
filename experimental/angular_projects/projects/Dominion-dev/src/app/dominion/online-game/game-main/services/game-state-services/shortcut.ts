import { utils               } from '../../../../../mylib/utilities';
import { Phase               } from '../../../types/phase';
import { GameState           } from '../../../types/game-state';
import { DCard               } from '../../../types/dcard';
import { UserInput           } from '../../../types/user-input';
import { DataForCardEffect   } from './card-effect-definitions/data-for-card-effect';
// import { getAdditionalEffect, getCardEffect } from './card-effect';


export const nextPhase = ( currentPhase: Phase ): Phase => {
  switch (currentPhase) {
    case ''            : return 'StartOfTurn';
    case 'StartOfTurn' : return 'Action';
    case 'Action'      : return 'BuyPlay';
    case '<Action>'     : return 'BuyPlay';
    case 'BuyPlay'     : return 'Night';
    case '<BuyPlay>'    : return 'Night';
    case 'BuyCard'     : return 'Night';
    case 'Night'       : return 'CleanUp';
    case 'CleanUp'     : return 'EndOfTurn';
    case 'EndOfTurn'   : return '';
    case 'GameIsOver'  : return 'GameIsOver';
    default            : return currentPhase;
  }
};

export const indeterminatePhaseOf = ( phase: Phase ): Phase => {
  switch (phase) {
    case 'Action'  : return '<Action>';
    case 'BuyPlay' : return '<BuyPlay>';
    case 'Night'   : return '<Night>';
    default        : return phase;
  }
};

export const determinatePhaseOf = ( phase: Phase ): Phase => {
  switch (phase) {
    case '<Action>'  : return 'Action';
    case '<BuyPlay>' : return 'BuyPlay';
    case '<Night>'   : return 'Night';
    default          : return phase;
  }
};


export const sortHandCards = ( gameState: GameState, playerId: number ) => {
  gameState.DCards.allPlayersCards[ playerId ].sortHandCards();
};


export const faceUp = ( dcards: DCard[], playerId?: number ) => {
  if ( playerId ) dcards.forEach( c => c.faceUp[ playerId ] = true );
  else dcards.forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = true ) );
};
export const faceDown = ( dcards: DCard[], playerId?: number ) => {
  if ( playerId ) dcards.forEach( c => c.faceUp[ playerId ] = false );
  else dcards.forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = false ) );
};
export const buttonize = ( dcards: DCard[], playerId?: number ) => {
  if ( playerId ) dcards.forEach( c => c.isButton[ playerId ] = true );
  else dcards.forEach( c => c.isButton.forEach( (_, i, ar) => ar[i] = true ) );
};
export const unbuttonize = ( dcards: DCard[], playerId?: number ) => {
  if ( playerId ) dcards.forEach( c => c.isButton[ playerId ] = false );
  else dcards.forEach( c => c.isButton.forEach( (_, i, ar) => ar[i] = false ) );
};


export const buttonizeForTurnPlayer = ( dcards: DCard[],
  gameState: GameState
) => {
  const pid = gameState.turnPlayerIndex();
  dcards.forEach( d => d.isButton[ pid ] = true );
};

export const buttonizeIf = ( dcards: DCard[],
  playerId: number,
  classifier: (c: DCard) => boolean
) => {
  dcards.filter( c => classifier(c) )
        .forEach( c => c.isButton[playerId] = true );
  dcards.filter( c => !classifier(c) )
        .forEach( c => c.isButton[playerId] = false );
};

export const buttonizeSupplyIf = ( gameState: GameState,
  playerId: number,
  condition: (Dcard: DCard) => boolean,
  gainCardStateSetter: (state: boolean) => void
) => {
  const topCards
    = ([] as DCard[]).concat(
          utils.object.map( gameState.DCards.BasicCards, e => e[0] ),
          gameState.DCards.KingdomCards.map( pile => pile[0] ) )
        .filter( c => c !== undefined );
  buttonizeIf( topCards, playerId, condition );
  gainCardStateSetter( true );
};


export const resetDCardsAttributes = ( gameState: GameState,
  gainCardStateSetter: (state: boolean) => void
) => {
  gainCardStateSetter( false );

  // ボタン化解除
  gameState.getAllDCards().forEach( c =>
      c.isButton.forEach( (_, i) => c.isButton[i] = false ) );

  // サプライは表に
  ([] as DCard[]).concat(
    gameState.DCards.BasicCards.getDCards(),
    gameState.DCards.KingdomCards.getDCards(),
    gameState.DCards.trashPile
  ).forEach( c => {
    c.faceUp.forEach( (_, i, ar) => ar[i] = true );
  });
  // 山札は裏に
  gameState.DCards.allPlayersCards.forEach( playerCards => {
    playerCards.Deck
      .forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = false ) );
  });
  // 場・捨て山は表に
  gameState.DCards.allPlayersCards.forEach( playerCards => {
    ([] as DCard[]).concat( playerCards.DiscardPile, playerCards.PlayArea )
      .forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = true ) );
  });
  // 手札は自分にのみ表に
  gameState.DCards.allPlayersCards.forEach( (playerCards, id) => {
    playerCards.HandCards
      .forEach( c => c.faceUp.forEach( (_, i, ar) => ar[i] = i === id ) );
  });
};



export const draw1Card = async ( playerId: number,
  data: DataForCardEffect
) => {
  const playerCards = data.gameState.DCards.allPlayersCards[ playerId ];

  // 引くカードが無い場合
  if ( playerCards.Deck.length + playerCards.DiscardPile.length < 1 ) return;

  data.gameStateSetter( data.gameState );
  if ( playerCards.Deck.length < 1 ) {
    const shuffleBy_adjusted
      = data.shuffleBy.filter( e => e < playerCards.DiscardPile.length );
    playerCards.Deck = playerCards.DiscardPile.map(
          (_, i) => playerCards.DiscardPile[ shuffleBy_adjusted[i] ] );
    playerCards.DiscardPile = [];
    faceDown( playerCards.Deck );
    await utils.asyncOperation.sleep( 0.1 );
    data.gameStateSetter( data.gameState );
  }
  await utils.asyncOperation.sleep( 0.1 );
  const top = playerCards.Deck.pop();
  if ( !!top ) playerCards.HandCards.push( top );
  data.gameStateSetter( data.gameState );
};

export const drawCards = async ( n: number, playerId: number,
  data: DataForCardEffect,
  showMessage: boolean
) => {
  if ( n <= 0 ) return;
  if ( showMessage ) {
    data.messager(
      `${data.playersNameList[ playerId ]}が${n}枚カードを引きました。`);
  }
  for ( let i = 0; i < n; ++i ) {
    await draw1Card( playerId, data );
  }
  await utils.asyncOperation.sleep( 0.1 );
  faceUp( data.gameState.DCards.allPlayersCards[ playerId ].HandCards );
  data.gameStateSetter( data.gameState );
};



export const playCard = ( dcard: DCard, playerId: number,
  data: DataForCardEffect,
  showMessage: boolean
) => {
  if ( showMessage ) {
    data.messager(
      `${data.playersNameList[ playerId ]}が${dcard.cardProperty.nameJp}をプレイしました。`);
  }
  data.gameState.removeDCards([dcard.id]);
  data.gameState.DCards.allPlayersCards[ playerId ].PlayArea.push( dcard );
  faceUp([dcard]);
  unbuttonize([dcard]);
  data.gameStateSetter( data.gameState );
  // await getCardEffect( dcard, playerId, data );
};


export const gainCard = ( dcard: DCard, playerId: number,
  data: DataForCardEffect,
  showMessage: boolean
) => {
  if ( showMessage ) {
    data.messager(
      `${data.playersNameList[ playerId ]}が${dcard.cardProperty.nameJp}を獲得しました。`);
  }
  data.gameState.removeDCards([dcard.id]);
  data.gameState.DCards.allPlayersCards[ playerId ].DiscardPile.push( dcard );
  unbuttonize([dcard]);
  data.gameStateSetter( data.gameState );
};


export const buyCard = ( dcard: DCard, playerId: number,
  data: DataForCardEffect,
  showMessage: boolean
) => {
  if ( showMessage ) {
    data.messager(
      `${data.playersNameList[ playerId ]}が${dcard.cardProperty.nameJp}を購入しました。`);
  }
  data.gameState.turnInfo.buy    -= 1;
  data.gameState.turnInfo.coin   -= dcard.cardProperty.cost.coin;
  data.gameState.turnInfo.potion -= dcard.cardProperty.cost.potion;
  gainCard( dcard, playerId, data, false );
};


export const discard = ( dcards: DCard[], playerId: number,
  data: DataForCardEffect,
  showMessage: boolean
) => {
  if ( showMessage ) {
    data.messager(
      `${data.playersNameList[ playerId ]}が${dcards.length}枚捨て札にしました。`);
  }
  data.gameState.removeDCards( dcards.map( c => c.id ) );
  const playerCards = data.gameState.DCards.allPlayersCards[ playerId ];
  playerCards.DiscardPile.push( ...dcards );
  data.gameStateSetter( data.gameState );
};


export const cleanUp = async ( playerId: number,
  data: DataForCardEffect
) => {
  // 場と手札のカードを捨て札に
  await utils.asyncOperation.sleep( 0.1 );
  const playerCards = data.gameState.DCards.allPlayersCards[ playerId ];
  discard( ([] as DCard[]).concat( playerCards.HandCards, playerCards.PlayArea ), playerId, data, false );
  // 手札に5枚カードを引く
  await drawCards( 5, playerId, data, false );
};


