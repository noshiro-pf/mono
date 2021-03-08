import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { combineLatest, Observable } from 'rxjs';
import { filter, startWith, withLatestFrom } from 'rxjs/operators';
import { GameConfigDialogComponent } from '../../dialogs/game-config-dialog/game-config-dialog.component';
import { HelpDialogComponent } from '../../dialogs/help-dialog/help-dialog.component';
import { GameConfigService } from '../../services/game-config.service';
import { GameMessageService } from '../../services/game-message.service';
import { GameRoomCommunicationService } from '../../services/game-room-communication.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { UserInputLogDialogComponent } from './user-input-log-dialog.component';

@Component({
  selector: 'app-sidebar-left',
  templateUrl: './sidebar-left.component.html',
  styleUrls: ['./sidebar-left.component.css'],
})
export class SideBarLeftComponent implements OnInit {
  @Input() autoScroll$!: Observable<boolean>;
  @Output() autoScrollChange = new EventEmitter<boolean>();

  @Input() myIndex$!: Observable<number>;
  @Input() chatOpened$!: Observable<boolean>;

  @Output() logSnapshot = new EventEmitter<void>();
  @Output() toggleShowCardPropertyButtons = new EventEmitter<void>();
  @Output() toggleSideNav = new EventEmitter<void>();
  @Output() initialStateIsReadyChange = new EventEmitter<boolean>();

  devMode$ = this.config.devMode$;

  newChatMessageAlert$!: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private myGameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private gameRoomCommunication: GameRoomCommunicationService,
    private config: GameConfigService,
    private gameMessageService: GameMessageService
  ) {}

  ngOnInit() {
    this.newChatMessageAlert$ = combineLatest(
      this.chatOpened$.pipe(
        filter((e) => e === true),
        startWith(true)
      ),
      this.gameRoomCommunication.chatList$.pipe(
        filter((list) => list.length > 0)
      ),
      (onOpen, receivedNewMessage) => 0
    ).pipe(withLatestFrom(this.chatOpened$, (_, chatOpened) => !chatOpened));
  }

  showHelpDialog() {
    this.dialog.open(HelpDialogComponent);
  }

  toggleSideNavClicked() {
    this.toggleSideNav.emit();
  }

  toggleAutoScroll(value: boolean) {
    this.autoScrollChange.emit(value);
  }

  toggleShowCardPropertyButtonsClicked() {
    this.toggleShowCardPropertyButtons.emit();
  }

  async settings() {
    const dialogRef = this.dialog.open(GameConfigDialogComponent);
    const result = await dialogRef.afterClosed().toPromise();
    if (result === 'terminateGame') {
      this.gameRoomCommunication.setTerminatedState(true);
    }
    if (result === 'resetGame') {
      this.initialStateIsReadyChange.emit(false);
      this.gameMessageService.pushMessage('【ゲームをリセットしました】');
      await Promise.all([
        this.gameRoomCommunication.setTerminatedState(false),
        this.gameRoomCommunication.setResultSubmittedState(false),
        this.gameRoomCommunication.removeAllUserInput(),
        this.gameRoomCommunication.sendUserInput(
          'clicked goToNextPhase',
          0,
          true
        ),
      ]);
      // 最初のプレイヤーは自動でgoToNextPhaseを1回発動
    }
  }

  // developer mode
  incrementTurnCounter(myIndex: number) {
    this.gameRoomCommunication.sendUserInput(
      'increment turnCounter',
      myIndex,
      true
    );
  }

  logSnapshotClicked() {
    this.logSnapshot.emit();
  }

  userInputLog() {
    const dialogRef = this.dialog.open(UserInputLogDialogComponent);
    dialogRef.componentInstance.gameState$ = this.gameStateService.gameState$;
    dialogRef.componentInstance.playersNameShuffled$ = this.myGameRoomService.playersNameShuffled$;
    dialogRef.componentInstance.userInputList$ = this.gameRoomCommunication.userInputList$;
  }
}
