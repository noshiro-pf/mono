import { CardProperty } from '../../../../types/card-property';

import { GameStateService } from './game-state.service';
import { UserInput } from '../../../types/user-input';
import { Phase } from '../../../types/phase';
import { DCard } from '../../../types/dcard';
import { GameState } from '../../../types/game-state';
import { buttonizeForTurnPlayer, buttonizeSupplyIf, resetDCardsAttributes, cleanUp } from './shortcut';
import { DataForCardEffect } from './card-effect-definitions/data-for-card-effect';



export const phaseAction = async ( data: DataForCardEffect,
    gainCardStateSetter: (state: boolean) => void,
) => {
  const shuffleBy = data.shuffleBy;

  while ( true ) {  // 自動フェーズ変更のため
    const turnInfo        = data.gameState.turnInfo;
    const turnPlayerCards = data.gameState.turnPlayerCards();
    const turnPlayerData  = data.gameState.turnPlayerData();
    const turnPlayerId    = data.gameState.turnPlayerIndex();

    resetDCardsAttributes( data.gameState, _ => gainCardStateSetter( true ) );

    const phaseBefore = turnInfo.phase;

    switch ( turnInfo.phase ) {
      case '': {
        turnInfo.action = 1;
        turnInfo.buy    = 1;
        turnInfo.coin   = 0;
        turnInfo.potion = 0;
        turnInfo.phase  = 'StartOfTurn';
        break;
      }

      case 'StartOfTurn': {
        turnInfo.phase = 'Action';
        break;
      }

      case 'Action': {
        const actionCards = turnPlayerCards.HandCards.filter( c =>
            c.cardProperty.cardTypes.includes('Action') );
        if ( turnInfo.action <= 0 || actionCards.length <= 0 ) {
          // 法貨を実装したらここの条件を変える必要あり
          turnInfo.phase = 'BuyPlay';
        } else {
          buttonizeForTurnPlayer( actionCards, data.gameState );
        }
        break;
      }

      case 'BuyPlay': {
        const treasureCards = turnPlayerCards.HandCards.filter( c =>
            c.cardProperty.cardTypes.includes('Treasure') );

        if ( treasureCards.length + turnPlayerData.vcoin <= 0 ) {
          turnInfo.phase = 'BuyCard';
        } else {
          buttonizeForTurnPlayer( treasureCards, data.gameState );
        }
        /* Pouchなどでbuyが増やせるのでBuyPlayフェーズではbuy <= 0 で自動遷移はできない */
        if ( turnInfo.buy > 0 ) {
          buttonizeSupplyIf( data.gameState, turnPlayerId,
              (c: DCard) => c.cardProperty.cost.coin   <= turnInfo.coin
                          && c.cardProperty.cost.potion <= turnInfo.potion,
              _ => gainCardStateSetter( true ) );
        }
        break;
      }

      case 'BuyCard': {
        if ( turnInfo.buy <= 0 ) {
          turnInfo.phase = 'Night';
        } else {
          buttonizeSupplyIf( data.gameState, turnPlayerId,
              (c: DCard) => c.cardProperty.cost.coin   <= turnInfo.coin
                          && c.cardProperty.cost.potion <= turnInfo.potion,
              _ => gainCardStateSetter( true ) );
        }
        break;
      }

      case 'Night': {
        // 未実装
        turnInfo.phase = 'CleanUp';
        break;
      }

      case 'CleanUp': {
        await cleanUp( turnPlayerId, data );
        turnInfo.phase = 'EndOfTurn';
        break;
      }

      case 'EndOfTurn': {
        if ( data.gameState.gameIsOverConditions() ) {
          turnInfo.phase = 'GameIsOver';
        } else {
          data.gameState.incrementTurnCounter();
          turnInfo.phase = '';
        }
        data.messager(`《${data.playersNameList[ turnPlayerId ]}のターン終了》`);
        break;
      }

      case 'GameIsOver': {
        data.gameStateSetter( data.gameState );
        break;
      }

      default:
        break;
    }
    // console.log(`it's ${gameState.turnPlayerIndex()}'s ${turnInfo.phase} phase` );

    if ( phaseBefore === turnInfo.phase ) break;
  }
};
