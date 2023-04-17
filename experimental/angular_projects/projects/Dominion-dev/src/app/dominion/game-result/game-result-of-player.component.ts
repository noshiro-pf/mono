import { Component, Input, OnInit } from '@angular/core';
import { RN, combine, manual } from 'rnjs';
import { TableSettings } from '../../mylib/data-table/types/table-settings';
import { utils } from '../../mylib/utilities';
import { GameResult } from '../types/game-result';
import { getAllPlayerGR } from './functions/get-all-player-gr';
import { PlayerGR } from './types/player-gr';

@Component({
  selector: 'app-game-result-of-player',
  template: `
    <div class="body-with-padding">
      <app-data-table [table]="table$ | async" [settings]="settings$ | async">
      </app-data-table>
    </div>
  `,
  styleUrls: ['../../mylib/data-table/data-table.component.css'],
})
export class GameResultOfPlayerComponent implements OnInit {
  private GRListFiltered$ = manual<GameResult[]>([]);
  @Input() set gameResultListFiltered(value: GameResult[]) {
    if (!value) return;
    this.GRListFiltered$.emit(value);
  }

  settings$!: RN<TableSettings>;
  table$!: RN<any[][]>;

  constructor() {}

  ngOnInit() {
    const GRofEachPlayerForView$: RN<PlayerGR[]> = this.GRListFiltered$.map(
      (GRlist) => getAllPlayerGR(GRlist)
    );

    const nofRankOption$: RN<number[]> = this.GRListFiltered$.map((list) =>
      utils.array.maxValue(list.map((e) => e.players.length))
    )
      .map((m) => utils.number.numSeq(1, m))
      .withInitialValue(utils.number.numSeq(1, 4));

    this.settings$ = nofRankOption$.map(
      (nofRankOption) =>
        new TableSettings({
          displayNo: false,
          usepagination: false,
          sortInit: { active: '1', direction: 'asc' },
          headerSettings: [
            {
              align: 'c',
              sort: true,
              displayName: '名前',
            },
            {
              sort: true,
              displayName: '平均得点',
              transform: (e) => utils.number.roundAt(e, 3).toString(),
              compareFn: utils.number.cmpR,
            },
            {
              sort: true,
              displayName: '総得点',
              transform: (e) => utils.number.roundAt(e, 3).toString(),
              compareFn: utils.number.cmpR,
            },
            {
              sort: true,
              displayName: '総対戦回数',
              compareFn: utils.number.cmpR,
            },
            ...nofRankOption.map((i) => ({
              sort: true,
              displayName: `${i}位回数`,
              compareFn: utils.number.cmpR,
            })),
          ],
        })
    );

    this.table$ = combine(GRofEachPlayerForView$, nofRankOption$).map(
      ([list, nofRankOption]) =>
        list.map((obj) => [
          obj.name,
          obj.scoreAverage,
          obj.scoreSum,
          obj.count,
          ...nofRankOption.map((i) => obj.countRank[i]),
        ])
    );
  }
}
