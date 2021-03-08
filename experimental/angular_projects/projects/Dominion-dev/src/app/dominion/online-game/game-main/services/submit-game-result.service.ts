import { Injectable } from '@angular/core';
import { FireDatabaseService } from '../../../../database/database.service';
import { utils } from '../../../../mylib/utilities';
import { GameResult } from '../../../types/game-result';
import { NumberOfVictoryCards } from '../../../types/number-of-victory-cards';
import { GameState } from '../../types/game-state';
import { GameStateService } from './game-state-services/game-state.service';
import { MyGameRoomService } from './my-game-room.service';

@Injectable()
export class SubmitGameResultService {
  // TODO: RxJS -> RN
  // gameResult$: Observable<GameResult>
  //   = combineLatest(
  //       // this.database.scoringTable$,
  //       // this.gameStateService.gameState$,
  //       // this.myGameRoomService.myGameRoom$,
  //       // this.database.expansionNameList$,
  //       // this.database.cardPropertyList$,
  //       (defaultScores, gameState, gameRoom, expansionNameList, cardPropertyList) => {
  //         const selectedExpansionNameList
  //           = expansionNameList.filter( (name, i) => gameRoom.isSelectedExpansions[i] );
  //         const selectedCards = gameRoom.selectedCards;
  //         const indexToId = (cardIndex: number) => cardPropertyList[cardIndex].cardId;
  //         const playersName = gameRoom.playersNameShuffled();
  //         const lastTurnPlayerName = playersName[ gameState.turnPlayerIndex() ];

  //         const gameResult = new GameResult( undefined, {
  //           timeStamp  : Date.now(),
  //           place      : 'Online',
  //           memo       : '',
  //           selectedExpansionNameList : selectedExpansionNameList,
  //           selectedCardsId : {
  //             Prosperity      : selectedCards.Prosperity,
  //             DarkAges        : selectedCards.DarkAges,
  //             KingdomCards10  : selectedCards.KingdomCards10 .map( indexToId ),
  //             BaneCard        : selectedCards.BaneCard       .map( indexToId ),
  //             EventCards      : selectedCards.EventCards     .map( indexToId ),
  //             Obelisk         : selectedCards.Obelisk        .map( indexToId ),
  //             LandmarkCards   : selectedCards.LandmarkCards  .map( indexToId ),
  //             BlackMarketPile : selectedCards.BlackMarketPile.map( indexToId ),
  //           },
  //           players : playersName.map( (name, i) => ({
  //                     name            : name,
  //                     NofVictoryCards : this.countNumberOfVictoryCards( i, gameState ),
  //                     VP              : 0,
  //                     turnOrder       : i,
  //                     rank            : 1,
  //                     score           : 0,
  //                   }) ),
  //           lastTurnPlayerName: lastTurnPlayerName,
  //         });

  //         gameResult.players.forEach( p => p.VP = p.NofVictoryCards.VPtotal() );
  //         gameResult.rankPlayers();
  //         gameResult.setScores( defaultScores );
  //         return gameResult;
  //       });

  constructor(
    private database: FireDatabaseService,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService
  ) {}

  submitGameResult(gameResult: GameResult) {
    return this.database.gameResult.add(gameResult);
  }

  private countNumberOfVictoryCards(
    playerIndex: number,
    gameState: GameState
  ): NumberOfVictoryCards {
    const nofVictoryCards = new NumberOfVictoryCards();
    nofVictoryCards.VPtoken = gameState.allPlayersData[playerIndex].VPtoken;
    const playerCards = gameState.DCards.allPlayersCards[playerIndex];
    const allCards = playerCards.getDCards();
    allCards
      .filter((dcard) => dcard.cardProperty.cardTypes.includes('Victory'))
      .forEach((dcard) => {
        nofVictoryCards[dcard.cardProperty.cardId]++;
      });
    nofVictoryCards.DeckSize = allCards.length;
    nofVictoryCards.numberOfActionCards = allCards.filter((e) =>
      e.cardProperty.cardTypes.includes('Action')
    ).length;
    nofVictoryCards.numberOfDifferentlyNamedCards = utils.array.uniq(
      allCards.map((e) => e.cardProperty.nameEng)
    ).length;
    nofVictoryCards.numberOfSilvers = allCards.filter(
      (e) => e.cardProperty.cardId === 'Silver'
    ).length;
    // TavernMatを追加したら編集
    nofVictoryCards.Distant_Lands_on_TavernMat = 0;
    return nofVictoryCards;
  }
}
