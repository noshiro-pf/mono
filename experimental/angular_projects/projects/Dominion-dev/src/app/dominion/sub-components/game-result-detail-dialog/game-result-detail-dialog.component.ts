import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { RN } from 'rnjs';
import { FireDatabaseService } from '../../../database/database.service';
import { ConfirmDialogComponent } from '../../../mylib/confirm-dialog.component';
import { CardProperty } from '../../types/card-property';
import { GameResult } from '../../types/game-result';
import { SelectedCards } from '../../types/selected-cards';
import { CardPropertyDialogComponent } from '../card-property-dialog/card-property-dialog.component';

@Component({
  selector: 'app-game-result-detail-dialog',
  templateUrl: './game-result-detail-dialog.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './game-result-detail-dialog.component.css',
  ],
})
export class GameResultDetailDialogComponent implements OnInit {
  gameResult: GameResult = new GameResult(); // input

  fullYear: number = new Date(this.gameResult.date).getFullYear();
  month: number = new Date(this.gameResult.date).getMonth() + 1;
  date: number = new Date(this.gameResult.date).getDate();

  selectedCards$!: RN<SelectedCards>;
  selectedExpansionNameList!: string[];

  firebasePath =
    'https://console.firebase.google.com/u/0/project/dominionapps/database/dominionapps/data/prod/gameResultList/';

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private database: FireDatabaseService,
  ) {}

  ngOnInit() {
    this.selectedExpansionNameList = this.gameResult.selectedExpansionNameList;

    this.firebasePath += this.gameResult.databaseKey;

    const toIndex = (id: string, list: CardProperty[]) =>
      list.findIndex((e) => e.cardId === id);

    this.selectedCards$ = this.database.cardPropertyList$.map((cardList) => {
      const result = new SelectedCards();
      const ids = this.gameResult.selectedCardsId;
      result.Prosperity = ids.Prosperity;
      result.DarkAges = ids.DarkAges;
      result.KingdomCards10 = (ids.KingdomCards10 || []).map((id) =>
        toIndex(id, cardList),
      );
      result.BaneCard = (ids.BaneCard || []).map((id) => toIndex(id, cardList));
      result.EventCards = (ids.EventCards || []).map((id) =>
        toIndex(id, cardList),
      );
      result.Obelisk = (ids.Obelisk || []).map((id) => toIndex(id, cardList));
      result.LandmarkCards = (ids.LandmarkCards || []).map((id) =>
        toIndex(id, cardList),
      );
      result.BlackMarketPile = (ids.BlackMarketPile || []).map((id) =>
        toIndex(id, cardList),
      );
      return result;
    });
  }

  cardInfoButtonClicked(cardIndex: number) {
    const dialogRef = this.dialog.open(CardPropertyDialogComponent, {
      autoFocus: false,
    });
    dialogRef.componentInstance.indiceInCardList = [cardIndex];
  }

  // edit() {

  // }

  deleteGameResult() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message =
      'ゲーム記録を削除してもよろしいですか？';
    dialogRef.afterClosed().subscribe((answer) => {
      if (answer === 'yes') {
        this.database.gameResult.remove(this.gameResult.databaseKey);
        this.openSnackBar();
      }
    });
  }

  private openSnackBar() {
    this.snackBar.open('Deleted.', undefined, { duration: 3000 });
  }
}
