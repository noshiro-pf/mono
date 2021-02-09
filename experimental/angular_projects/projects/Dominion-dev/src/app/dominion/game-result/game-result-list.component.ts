import { Component, OnInit, Input } from '@angular/core';

import { RN, manual } from 'rnjs';

import { MatDialog } from '@angular/material';

import { FireDatabaseService } from '../../database/database.service';
import { SetMemoDialogComponent } from '../sub-components/set-memo-dialog.component';
import { GameResultDetailDialogComponent    } from '../sub-components/game-result-detail-dialog/game-result-detail-dialog.component';
import { GameResult } from '../types/game-result';
import { TableSettings } from '../../mylib/data-table/types/table-settings';
import { CellPosition } from '../../mylib/data-table/types/cell-position';


@Component({
  selector: 'app-game-result-list',
  template: `
    <ng-container *ngIf="{
          GRlistFiltered : GRlistFiltered$ | async,
          table          : table$          | async
        } as data">
      <div class="body-with-padding">
        <app-data-table
          [table]='data.table'
          [settings]='settings'
          (clickedCellPosition)='cellOnClick( $event, data.GRlistFiltered )' >
        </app-data-table>
      </div>
    </ng-container>
  `,
})
export class GameResultListComponent implements OnInit {

  GRlistFiltered$ = manual<GameResult[]>([]);

  @Input() set gameResultListFiltered( value: GameResult[] ) {
    if ( !value ) return;
    this.GRlistFiltered$.emit( value );
  }

  settings = new TableSettings({
    displayNo           : true,
    usepagination       : true,
    itemsPerPageInit    : 25,
    itemsPerPageOptions : [ 25, 50, 100, 200, 400 ],
    sortInit            : { active: '0', direction: 'desc' },
    headerSettings      : [
      {
        displayName : '日付',
        align       : 'c',
        sort        : true,
        transform : (e: number) => {
          const date = new Date(e);
          return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        },
      }, {
        displayName : '場所',
        align       : 'c',
        filterType  : 'select',
        sort        : true,
      }, {
        displayName : 'スコア',
        align       : 'c',
        makeSubTable : true,
        subTableHeader : [
          { name: 'Rank',  width: 'narrow' },
          { name: 'Name',  width: 'normal' },
          { name: 'VP',    width: 'narrow' },
          { name: 'Score', width: 'narrow' },
        ]
      }, {
        displayName : 'メモ',
        align       : 'c',
        isButton : true,
      }, {
        displayName : '詳細',
        align       : 'c',
        isButton : true,
      }
    ],
  });


  table$!: RN<any[][]>;



  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService
  ) {
    this.table$ = this.GRlistFiltered$.map( GRlist =>
      GRlist.map( gr => [
        gr.date,
        gr.place,
        gr.players.map( grpl => [
          grpl.rank,
          grpl.name,
          grpl.VP,
          grpl.score,
        ]),
        'memo',
        'Detail',
      ])
    );
  }

  ngOnInit() {}


  cellOnClick( position: CellPosition, GRlist: GameResult[] ) {
    switch ( position.columnIndex ) {
      case 3 : this.editMemo( GRlist[position.rowIndex] ); break;
      case 4 : this.showDetail( GRlist[position.rowIndex] ); break;
      default : break;
    }
  }

  private editMemo( gameResult: GameResult ) {
    const dialogRef = this.dialog.open( SetMemoDialogComponent );
    dialogRef.componentInstance.memo = gameResult.memo;
    dialogRef.afterClosed().subscribe( result => {
      if ( result === undefined ) return;
      this.database.gameResult.setMemo( gameResult.databaseKey, result );
    });
  }

  private showDetail( gameResult: GameResult ) {
    const dialogRef = this.dialog.open( GameResultDetailDialogComponent, { autoFocus: false } );
    dialogRef.componentInstance.gameResult = gameResult;
  }
}
