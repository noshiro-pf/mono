import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { GameRoomCommunicationService } from '../../services/game-room-communication.service';
import { MyGameRoomService } from '../../services/my-game-room.service';

@Component({
  selector: 'app-other-players-area',
  template: `
    <ng-container
      *ngIf="{
        thinkingState: thinkingState$ | async,
        playersNameShuffled: playersNameShuffled$ | async
      } as data"
    >
      <ng-container *ngIf="!!data.thinkingState">
        <ng-container
          *ngFor="let name of data.playersNameShuffled; let playerIndex = index"
        >
          <app-small-player-area
            [playerIndex]="playerIndex"
            [playerName]="name"
            [thinkingState]="data.thinkingState[playerIndex]"
            (cardClicked)="onCardClick($event)"
          >
          </app-small-player-area>
        </ng-container>
      </ng-container>
    </ng-container>
  `,
  styles: [],
})
export class OtherPlayerAreaComponent implements OnInit {
  playersNameShuffled$: Observable<string[]> =
    this.myGameRoomService.playersNameShuffled$;

  thinkingState$: Observable<boolean[]> = this.communication.thinkingState$;

  @Output() cardClicked = new EventEmitter<any>();

  constructor(
    private myGameRoomService: MyGameRoomService,
    private communication: GameRoomCommunicationService,
  ) {}

  ngOnInit() {}

  onCardClick(value: any) {
    this.cardClicked.emit(value);
  }
}
