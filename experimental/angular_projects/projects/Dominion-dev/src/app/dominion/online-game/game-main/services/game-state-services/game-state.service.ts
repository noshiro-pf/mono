import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject, combineLatest } from 'rxjs';

import { MyGameRoomService } from '../my-game-room.service';
import { GameRoomCommunicationService } from '../game-room-communication.service';
import { PlayerCards } from '../../../types/player-cards';
import { GameState   } from '../../../types/game-state';
import { TurnInfo    } from '../../../types/turn-info';
import { PlayerData  } from '../../../types/players-data';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';


@Injectable()
export class GameStateService {

  private gameStateSource = new BehaviorSubject<GameState>( new GameState() );
  gameState$: Observable<GameState> = this.gameStateSource.asObservable();

  private turnInfo$: Observable<TurnInfo> = this.gameState$.pipe( map( e => e.turnInfo ) );
  action$       = this.turnInfo$.pipe( map( e => e.action ), distinctUntilChanged() );
  buy$          = this.turnInfo$.pipe( map( e => e.buy    ), distinctUntilChanged() );
  coin$         = this.turnInfo$.pipe( map( e => e.coin   ), distinctUntilChanged() );
  potion$       = this.turnInfo$.pipe( map( e => e.potion ), distinctUntilChanged() );
  phase$        = this.turnInfo$.pipe( map( e => e.phase  ), distinctUntilChanged() );
  runningCards$ = this.turnInfo$.pipe( map( e => e.runningCards ) );

  allPlayersData$  = this.gameState$.pipe( map( e => e.allPlayersData         ) );
  allPlayersCards$ = this.gameState$.pipe( map( e => e.DCards.allPlayersCards ) );
  BasicCards$      = this.gameState$.pipe( map( e => e.DCards.BasicCards      ) );
  KingdomCards$    = this.gameState$.pipe( map( e => e.DCards.KingdomCards    ) );
  trashPile$       = this.gameState$.pipe( map( e => e.DCards.trashPile       ) );
  BlackMarketPile$ = this.gameState$.pipe( map( e => e.DCards.BlackMarketPile ) );

  turnPlayerIndex$: Observable<number>
    = this.gameState$.pipe( map( e => e.turnPlayerIndex() ), distinctUntilChanged() );
  nextTurnPlayerIndex$: Observable<number>
    = this.gameState$.pipe( map( e => e.nextTurnPlayerIndex() ), distinctUntilChanged() );

  turnPlayersName$: Observable<string>
    = combineLatest(
          this.turnPlayerIndex$,
          this.myGameRoomService.playersNameShuffled$,
          (index, list) => list[index] );

  turnPlayerCards$: Observable<PlayerCards>
    = combineLatest(
        this.allPlayersCards$, this.turnPlayerIndex$,
        (allPlayersCards, turnPlayerIndex) =>
          allPlayersCards[ turnPlayerIndex ] || new PlayerCards() );

  myData$: Observable<PlayerData>
    = combineLatest(
        this.allPlayersData$, this.myGameRoomService.myIndex$,
        (allPlayersData, myIndex) =>
          allPlayersData[ myIndex ] || new PlayerData() );

  myCards$: Observable<PlayerCards>
    = combineLatest(
        this.allPlayersCards$, this.myGameRoomService.myIndex$,
        (allPlayersCards, myIndex) =>
          allPlayersCards[ myIndex ] || new PlayerCards() );

  isMyTurn$: Observable<boolean>
    = combineLatest(
        this.turnPlayerIndex$,
        this.myGameRoomService.myIndex$,
        (turnPlayerIndex, myIndex) => (turnPlayerIndex === myIndex) )
      .pipe(
        distinctUntilChanged(),
        startWith( false ) );

  gameIsOver$: Observable<boolean>
    = combineLatest(
          this.gameState$,
          this.gameRoomCommunication.isTerminated$,
          (gameState, isTerminated) =>
            gameState.gameIsOver() || isTerminated )
        .pipe( distinctUntilChanged() );


  constructor(
    private myGameRoomService: MyGameRoomService,
    private gameRoomCommunication: GameRoomCommunicationService
  ) {
  }


  setGameState( gameState: GameState ) {
    this.gameStateSource.next( gameState );
  }

}
