import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CardProperty } from '../../../../types/card-property';
import { GameResult } from '../../../../types/game-result';

@Component({
  selector: 'app-online-game-result-dialog',
  templateUrl: './online-game-result-dialog.component.html',
  styleUrls: [
    '../../../../../mylib/data-table/data-table.component.css',
    './online-game-result-dialog.component.css',
  ],
})
export class OnlineGameResultDialogComponent implements OnInit {
  gameResult$!: Observable<GameResult>; // input
  cardPropertyList$!: Observable<CardProperty[]>;

  constructor() {}

  ngOnInit() {}
}
