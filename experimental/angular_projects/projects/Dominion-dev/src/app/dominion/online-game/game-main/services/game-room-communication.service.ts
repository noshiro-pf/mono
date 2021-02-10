import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import { Observable, combineLatest } from 'rxjs';
import { first, startWith, switchMap, distinctUntilChanged, filter, map } from 'rxjs/operators';


import { ChatMessage, ChatCommand } from '../../types/chat-message';
import { GameCommunication        } from '../../types/game-room-communication';
import { UserInput                } from '../../types/user-input';
import { UserInputCommand         } from '../../types/user-input-command';

import { UserService             } from '../../../../database/user.service';
import { FireDatabaseService } from '../../../../database/database.service';
import { utils } from '../../../../mylib/utilities';
import { MyGameRoomService } from './my-game-room.service';
import { RN } from 'rnjs';


@Injectable()
export class GameRoomCommunicationService {

  // TODO: RxJS -> RN
  private myName$: RN<string>
    = this.user.name$; // .pipe( first() );
  private communicationId$: RN<string>
    = this.user.onlineGame.communicationId$; // .pipe( first() );

  chatList$:          Observable<ChatMessage[]>;
  userInputList$:     Observable<UserInput[]>;
  resetGameClicked$:  Observable<number>;
  thinkingState$:     Observable<boolean[]>;
  presenceState$:     Observable<boolean[]>;
  isTerminated$:      Observable<boolean>;
  resultIsSubmitted$: Observable<boolean>;

  private nofAllDCards!: number;


  constructor(
    private afdb: AngularFireDatabase,
    private user: UserService,
    private database: FireDatabaseService,
    private myGameRoomService: MyGameRoomService,
  ) {
    // const gameRoomCommunication$
    //   = combineLatest(
    //       this.database.onlineGameCommunicationList$,
    //       this.myGameRoomService.gameRoomCommunicationId$,
    //       (list, id) => list.find( e => e.databaseKey === id ) || new GameCommunication() );

    // this.chatList$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.list<ChatMessage>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/chatList` )
    //         .valueChanges(['child_added']) ),
    //       distinctUntilChanged( (a, b) => a === b, x => x.length ) );

    // this.userInputList$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.list<UserInput>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/userInputList` )
    //         .valueChanges(['child_added']) ),
    //       map( list => list.map( (e, i) => new UserInput(e, i))),
    //       distinctUntilChanged( (a, b) => a === b, x => x.length ) );

    // this.resetGameClicked$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.object<number>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/resetGameClicked` )
    //         .valueChanges() ),
    //       map( e => e || 0 ),  // null to false
    //       distinctUntilChanged() );

    // this.thinkingState$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.list<boolean>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/thinkingState` )
    //         .valueChanges() ),
    //       filter( list => list !== undefined && list.length > 0 ),
    //       distinctUntilChanged() );

    // this.presenceState$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.list<boolean>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/presenceState` )
    //         .valueChanges() ),
    //       filter( list => list !== undefined && list.length > 0 ),
    //       distinctUntilChanged() );

    // this.isTerminated$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.object<boolean>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/isTerminated` )
    //         .valueChanges() ),
    //       map( e => !!e ),  // null to false
    //       distinctUntilChanged() );

    // this.resultIsSubmitted$
    //   = this.myGameRoomService.gameRoomCommunicationId$.pipe(
    //       switchMap( id =>
    //         this.afdb.object<boolean>(
    //           `${this.database.dbPath.onlineGameCommunicationList}/${id}/resultIsSubmitted` )
    //         .valueChanges() ),
    //       map( e => !!e ),  // null to false
    //       distinctUntilChanged() );

    // this.myGameRoomService.initialState$.pipe( first() )
    //   .subscribe( initialState =>
    //     this.nofAllDCards = initialState.getAllDCards().length );
  }


  async sendMessage( messageString: string, command: ChatCommand = '' ) {
    const communicationId = await this.communicationId$.toPromise();
    const myName = await this.myName$.toPromise();
    const msg = new ChatMessage({
                  playerName: myName,
                  content:    messageString,
                  command:    command,
                  timeStamp:  Date.now()
                });
    await this.database.onlineGameCommunication
            .sendMessage( communicationId, msg );
  }

  async sendUserInput(
    userInputCommand: UserInputCommand,
    playerId: number,
    autoSort: boolean,
    clickedCardId?: number
  ) {
    const communicationId = await this.communicationId$.toPromise();
    const userInput
      = new UserInput({
              command:  userInputCommand,
              data: {
                playerId:      playerId,
                autoSort:      autoSort,
                clickedCardId: clickedCardId || 0,
                shuffleBy:     utils.number.random.permutation( this.nofAllDCards ),
              },
            }, undefined );
    await this.database.onlineGameCommunication
            .sendUserInput( communicationId, userInput );
  }


  async removeAllUserInput() {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .removeAllUserInput( communicationId );
  }

  async setThinkingState( playerId: number, state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setThinkingState( communicationId, playerId, state );
  }

  async setPresenceState( playerId: number, state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setPresenceState( communicationId, playerId, state );
  }

  async setTerminatedState( state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setTerminatedState( communicationId, state );
  }

  async setResultSubmittedState( state: boolean ) {
    const communicationId = await this.communicationId$.toPromise();
    await this.database.onlineGameCommunication
            .setResultSubmittedState( communicationId, state );
  }
}
