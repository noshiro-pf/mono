import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { GameState } from '../../../types/game-state';
import { UserInput } from '../../../types/user-input';

@Component({
  selector: 'app-user-input-log-dialog',
  template: `
    <div mat-dialog-title>ログ</div>
    <div mat-dialog-content>
      <div *ngIf="userInputLog$ | async as userInputLog">
        <div *ngFor="let userInput of userInputLog">
          {{ userInput.playerName }}, "{{ userInput.command }}",
          {{ userInput.clickedCardName }} (id = {{ userInput.clickedCardId }});
        </div>
      </div>
    </div>
    <div mat-dialog-actions class="center">
      <button mat-raised-button mat-dialog-close="" color="primary">OK</button>
    </div>
  `,
  styles: [
    `
      .center {
        justify-content: center;
      }
    `,
  ],
})
export class UserInputLogDialogComponent implements OnInit {
  userInputList$!: Observable<UserInput[]>;
  playersNameShuffled$!: Observable<string[]>;
  gameState$!: Observable<GameState>;

  userInputLog$!: Observable<any>;

  constructor() {}

  ngOnInit() {
    this.userInputLog$ = combineLatest(
      this.userInputList$,
      this.playersNameShuffled$,
      this.gameState$,
      (userInputList, playerNames, gameState) =>
        userInputList.map((userInput) => ({
          playerName: playerNames[userInput.data.playerId],
          command: userInput.command,
          clickedCardId: userInput.data.clickedCardId,
          clickedCardName: gameState.getDCard(userInput.data.clickedCardId)
            .cardProperty.nameJp,
        })),
    );
  }
}
