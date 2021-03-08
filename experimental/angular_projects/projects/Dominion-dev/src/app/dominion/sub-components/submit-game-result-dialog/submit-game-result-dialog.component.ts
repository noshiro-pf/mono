import { Component, OnInit } from '@angular/core';
import { FireDatabaseService } from '../../../database/database.service';
import { GameResult } from '../../types/game-result';

@Component({
  selector: 'app-submit-game-result-dialog',
  templateUrl: './submit-game-result-dialog.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './submit-game-result-dialog.component.css',
  ],
})
export class SubmitGameResultDialogComponent implements OnInit {
  newGameResult!: GameResult; // input

  fullYear: number = new Date(this.newGameResult.date).getFullYear();
  month: number = new Date(this.newGameResult.date).getMonth() + 1;
  date: number = new Date(this.newGameResult.date).getDate();

  constructor(private database: FireDatabaseService) {}

  ngOnInit() {
    this.database.scoringTable$ // .pipe( first() )
      .subscribe((defaultScores) => {
        this.newGameResult.rankPlayers();
        this.newGameResult.setScores(defaultScores);
      });
  }

  submitGameResult() {
    this.database.gameResult.add(this.newGameResult);
  }
}
