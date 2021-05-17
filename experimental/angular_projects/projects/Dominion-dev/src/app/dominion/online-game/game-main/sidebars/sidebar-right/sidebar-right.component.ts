import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FireDatabaseService } from '../../../../../database/database.service';
import { ConfirmDialogComponent } from '../../../../../mylib/confirm-dialog.component';
import { GameResult } from '../../../../types/game-result';
import { OnlineGameResultDialogComponent } from '../../dialogs/online-game-result-dialog/online-game-result-dialog.component';
import { OnlineGamePlayerCardsDialogComponent } from '../../dialogs/online-game-result-player-cards-dialog/online-game-result-player-cards-dialog.component';
import { GameRoomCommunicationService } from '../../services/game-room-communication.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { MyGameRoomService } from '../../services/my-game-room.service';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.css'],
})
export class SideBarRightComponent implements OnInit {
  @Input() gameResult$!: Observable<GameResult>;
  // TODO: RxJS -> RN
  // myIndex$ = this.myGameRoomService.myIndex$;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private database: FireDatabaseService,
    private gameStateService: GameStateService,
    private myGameRoomService: MyGameRoomService,
    private gameCommunication: GameRoomCommunicationService
  ) {}

  ngOnInit() {}

  showGameResultDialog() {
    const dialogRef = this.dialog.open(OnlineGameResultDialogComponent);
    dialogRef.componentInstance.gameResult$ = this.gameResult$;
    // dialogRef.componentInstance.cardPropertyList$ = this.database.cardPropertyList$;
  }

  showPlayerCards() {
    const dialogRef = this.dialog.open(OnlineGamePlayerCardsDialogComponent);
    dialogRef.componentInstance.allPlayersCards$ =
      this.gameStateService.allPlayersCards$;
    // TODO: RxJS -> RN
    // dialogRef.componentInstance.playersNameList$ = this.myGameRoomService.playersNameShuffled$;
  }

  exit(myIndex: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message =
      '退室しますか？（退室しても新しいゲームを始めるまではこの画面に戻ることができます。）';
    dialogRef.afterClosed().subscribe((yn) => {
      if (yn === 'yes') {
        this.router.navigate(['/online-game']);
        this.gameCommunication.setPresenceState(myIndex, false);
        this.gameCommunication.sendMessage('', 'leaveTheRoom');
      }
    });
  }
}
