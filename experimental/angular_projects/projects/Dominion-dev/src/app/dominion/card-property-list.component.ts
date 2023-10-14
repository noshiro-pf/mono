import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RN } from 'rnjs';
import { FireDatabaseService } from '../database/database.service';
import { CellPosition } from '../mylib/data-table/types/cell-position';
import { TableSettings } from '../mylib/data-table/types/table-settings';
import { utils } from '../mylib/utilities';
import {
  cardCostToStr,
  cardTypeToJpStr,
  implementedToStr,
  randomizerCandidateToStr,
} from './functions/transform-card-property';
import { CardPropertyDialogComponent } from './sub-components/card-property-dialog/card-property-dialog.component';
import { cmpCardCost } from './types/card-cost';

const setNameIndex = [
  '基本1',
  '基本2',
  '陰謀1',
  '陰謀2',
  '海辺',
  '錬金術',
  '繁栄',
  '収穫祭',
  '異郷',
  '暗黒時代',
  'ギルド',
  '冒険',
  '帝国',
  '夜想曲',
].reduce(
  (acc, v, i) => {
    acc[v] = i;
    return acc;
  },
  {} as { [key: string]: number }
);

@Component({
  selector: 'app-card-property-list',
  template: `
    <div class="body-with-padding">
      <app-data-table
        [table]="table$ | async"
        [settings]="settings"
        (clickedCellPosition)="showDetail($event)"
        (tableFilteredIndexedChange)="tableFilteredIndexedOnChange($event)"
      >
      </app-data-table>
    </div>
  `,
})
export class CardPropertyListComponent implements OnInit {
  settings = new TableSettings({
    displayNo: true,
    usepagination: true,
    itemsPerPageInit: 25,
    itemsPerPageOptions: [25, 50, 100, 200],
    headerSettings: [
      {
        filterType: 'input',
        displayName: '名前',
        isButton: true,
        sort: true,
      },
      {
        filterType: 'input',
        displayName: 'Name',
        sort: true,
      },
      {
        filterType: 'multiSelect-or',
        displayName: 'セット名',
        sort: true,
        compareFn: (a: string, b: string): number =>
          setNameIndex[a] - setNameIndex[b],
      },
      {
        filterType: 'select',
        displayName: '分類',
        sort: true,
      },
      {
        filterType: 'multiSelect-and',
        displayName: '種別',
        transform: cardTypeToJpStr,
        sort: true,
      },
      {
        filterType: 'none',
        displayName: 'コスト',
        sort: true,
        transform: cardCostToStr,
        compareFn: cmpCardCost,
      },
      {
        filterType: 'none',
        displayName: 'VP',
        sort: true,
        compareFn: utils.number.cmp,
      },
      {
        filterType: 'none',
        displayName: '+card',
        sort: true,
        compareFn: utils.number.cmp,
      },
      {
        filterType: 'none',
        displayName: '+action',
        sort: true,
        compareFn: utils.number.cmp,
      },
      {
        filterType: 'none',
        displayName: '+buy',
        sort: true,
        compareFn: utils.number.cmp,
      },
      {
        filterType: 'none',
        displayName: '+coin',
        sort: true,
        compareFn: utils.number.cmp,
      },
      {
        filterType: 'none',
        displayName: '+VPtoken',
        sort: true,
        compareFn: utils.number.cmp,
      },
      {
        filterType: 'select',
        displayName: 'ゲーム実装状況',
        transform: (value) => implementedToStr(<boolean>value),
        sort: true,
      },
      {
        filterType: 'select',
        displayName: 'ランダマイザー対象',
        transform: (value) => randomizerCandidateToStr(<boolean>value),
        sort: true,
      },
    ],
  });

  table$: RN<any[][]> = this.database.cardPropertyList$.map((list) =>
    list.map((obj) => [
      obj.nameJp, // '名前'
      obj.nameEng, // 'Name'
      obj.expansionName, // 'セット名'
      obj.category, // '分類'
      obj.cardTypes, // '種別'
      obj.cost, // 'コスト'
      obj.VP, // 'VP'
      obj.drawCard, // '+card'
      obj.action, // '+action'
      obj.buy, // '+buy'
      obj.coin, // '+coin'
      obj.VPtoken, // '+VPtoken'
      obj.implemented, // 'ゲーム実装状況'
      obj.randomizerCandidate, // 'ランダマイザー対象'
    ])
  );

  filteredIndice: number[] = [];

  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService
  ) {}

  ngOnInit() {}

  showDetail(position: CellPosition) {
    const dialogRef = this.dialog.open(CardPropertyDialogComponent, {
      autoFocus: false,
    });
    dialogRef.componentInstance.indiceInCardList = this.filteredIndice;
    dialogRef.componentInstance.showingIndexInit =
      position.rowIndexInTableFiltered;
  }

  tableFilteredIndexedOnChange(tbl: { val: any; idx: number }[]) {
    this.filteredIndice = tbl.map((e) => e.idx);
  }
}
