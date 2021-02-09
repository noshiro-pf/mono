import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from '../../../../mylib/confirm-dialog.component';

import { MessageForMeListDialogComponent } from '../dialogs/message-for-me-dialog-list.component';
import { GameRoomCommunicationService } from '../services/game-room-communication.service';
import { DCard } from '../../types/dcard';


@Component({
  selector: 'app-my-area',
  templateUrl: './my-area.component.html',
  styleUrls: ['./my-area.component.css']
})
export class MyAreaComponent implements OnInit {

  @Input() isMyTurn$!:                Observable<boolean>;
  @Input() isBuyPlayPhase$!:          Observable<boolean>;
  @Input() gameMessageList$!:         Observable<string[]>;
  @Input() gameMessageListSliced$!:   Observable<string[]>;
  @Input() gameMessageIndexDelayed$!: Observable<number>;
  @Input() myIndex$!:                 Observable<number>;
  @Input() autoSort$!:                Observable<boolean>;
  @Input() showCardProperty$!:        Observable<boolean>;
  @Input() gameIsOver$!:              Observable<boolean>;
  @Input() myThinkingState$!:         Observable<boolean>;

  @Output() cardClicked  = new EventEmitter<DCard>();
  @Output() vcoinClicked = new EventEmitter<void>();
  @Output() debtClicked  = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private gameRoomCommunication: GameRoomCommunicationService,
  ) { }

  ngOnInit() {
  }


  showMessageHistory( gameMessageList: string[] ) {
    const dialogRef = this.dialog.open( MessageForMeListDialogComponent );
    dialogRef.componentInstance.gameMessageList = gameMessageList;
  }

  onCardClick( value: DCard ) { this.cardClicked.emit( value ); }
  vcoinClick() { this.vcoinClicked.emit(); }
  debtClick() { this.debtClicked.emit(); }


  toggleMyThinkingState( currentState: boolean, myIndex: number ) {
    this.gameRoomCommunication.setThinkingState( myIndex, !currentState );
  }


  async goToNextPhase( myIndex: number, autoSort: boolean ) {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = '次のフェーズに移動します。';
    const yn = await dialogRef.afterClosed().toPromise();
    if ( yn === 'yes' ) {
      this.gameRoomCommunication.sendUserInput(
          'clicked goToNextPhase', myIndex, autoSort );
    }
  }

  async finishMyTurn( myIndex: number, autoSort: boolean ) {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = 'ターンを終了します。';
    const yn = await dialogRef.afterClosed().toPromise();
    if ( yn === 'yes' ) {
      this.gameRoomCommunication.sendUserInput(
          'clicked finishMyTurn', myIndex, autoSort );
    }
  }

  sortMyHandCards( myIndex: number ) {
    this.gameRoomCommunication.sendUserInput(
        'clicked sortHandcards', myIndex, false );
  }

  playAllTreasures( myIndex: number, autoSort: boolean ) {
    this.gameRoomCommunication.sendUserInput(
        'play all treasures', myIndex, autoSort );
  }


}
