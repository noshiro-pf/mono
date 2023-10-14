import { Component, OnInit } from '@angular/core';
import { RN } from 'rnjs';
import { FireDatabaseService } from '../../database/database.service';
import { TableSettings } from '../../mylib/data-table/types/table-settings';

@Component({
  selector: 'app-scoring-table',
  template: `
    <div class="body-with-padding">
      <ng-container *ngIf="scoringTableForView$ | async as table">
        <app-data-table [table]="table" [settings]="settings"> </app-data-table>
        <app-waiting-spinner [waiting]="!table"></app-waiting-spinner>
      </ng-container>
    </div>
  `,
})
export class ScoringTableComponent implements OnInit {
  scoringTableForView$: RN<string[][]>;

  settings = new TableSettings({
    displayNo: false,
    usepagination: false,
    headerSettings: [
      { displayName: 'プレイヤー数' },
      { displayName: '1位' },
      { displayName: '2位' },
      { displayName: '3位' },
      { displayName: '4位' },
      { displayName: '5位' },
      { displayName: '6位' },
    ],
  });

  constructor(private database: FireDatabaseService) {
    this.scoringTableForView$ = this.database.scoringTable$.map(
      (scoringTable) =>
        scoringTable
          .map((value, index) => ({ nofPlayers: index, score: value }))
          .filter((e) => e.score[1] > 0)
          .map((e) => [
            e.nofPlayers.toString(),
            e.score[1] < 0 ? '' : e.score[1].toString(),
            e.score[2] < 0 ? '' : e.score[2].toString(),
            e.score[3] < 0 ? '' : e.score[3].toString(),
            e.score[4] < 0 ? '' : e.score[4].toString(),
            e.score[5] < 0 ? '' : e.score[5].toString(),
            e.score[6] < 0 ? '' : e.score[6].toString(),
          ]),
    );
  }

  ngOnInit() {}
}
