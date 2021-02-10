import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { takeWhile, map, startWith, filter, delay } from 'rxjs/operators';

import { MatDialog, MatDialogRef } from '@angular/material';

import { UserService             } from '../../../database/user.service';
import { FireDatabaseService } from '../../../database/database.service';
import { GameRoom } from '../types/game-room';
import { SelectedCards } from '../../types/selected-cards';


@Component({
  selector: 'app-sign-in-to-game-room-dialog',
  templateUrl: './sign-in-to-game-room-dialog.component.html',
  styleUrls: ['./sign-in-to-game-room-dialog.component.css']
})
export class SignInToGameRoomDialogComponent implements OnInit, OnDestroy {
  private alive: boolean = true;

  newRoom!: GameRoom;  // input
  dialogRef!: any;  // input

  allPlayersAreReady$!: Observable<boolean>;
  selectedExpansionNameList$!: Observable<string[]>;
  selectedCards$!: Observable<SelectedCards>;

  playersNameList$!: Observable<string[]>;


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private database: FireDatabaseService,
    private user: UserService
  ) { }

  ngOnInit() {
    this.selectedCards$ = of( this.newRoom.selectedCards );

    this.user.setOnlineGameRoomId( this.newRoom.databaseKey );
    this.user.setGameCommunicationId( this.newRoom.gameRoomCommunicationId );

    // TODO: RxJS -> RN
    // set Observables
    // this.playersNameList$
    //   = this.database.onlineGameRooms$.pipe(
    //       map( list => ( list.find( e => e.databaseKey === this.newRoom.databaseKey )
    //                         || new GameRoom() ).playersNameList ),
    //       startWith([]) );

    // const selectingRoomRemoved$
    //   = this.database.onlineGameRooms$.pipe(
    //       map( list => !list.map( e => e.databaseKey )
    //                          .includes( this.newRoom.databaseKey ) ) );

    this.allPlayersAreReady$
      = this.playersNameList$.pipe(
          map( e => e.length >= this.newRoom.numberOfPlayers ),
          startWith( false ) );

    // this.selectedExpansionNameList$
    //   = this.database.expansionNameList$.pipe(
    //       map( val => val.filter( (_, i) => this.newRoom.isSelectedExpansions[i] ) ),
    //       startWith([]) );


    // subscriptions
    // selectingRoomRemoved$.pipe(
    //     filter( e => e === true ),
    //     takeWhile( () => this.alive ) )
    //   .subscribe( () => this.dialogRef.close() );

    this.allPlayersAreReady$.pipe(
        filter( e => e === true ),
        takeWhile( () => this.alive ),
        delay( 1000 ) )
      .subscribe( () => {
        this.router.navigate( ['/online-game-main'] );
        this.dialogRef.close();
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

}
