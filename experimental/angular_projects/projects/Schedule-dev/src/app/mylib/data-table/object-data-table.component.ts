import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { RN } from 'rnjs';

import { CellPosition } from './types/cell-position';
import { IObjectTableSettings } from './types/object-table-settings';

@Component({
  selector: 'app-object-data-table',
  template: `
    <app-data-table
        [table]="table$ | async">
    </app-data-table>
  `,
  styles: []
})
export class ObjectDataTableComponent implements OnInit {

  @Input() table$!: RN<any[][]>;
  @Input() settings!: IObjectTableSettings;

  @Output() clickedCellPosition = new EventEmitter<CellPosition>();

  @Output() tableFilteredIndexedChange = new EventEmitter<{ val: any, idx: number }[]>();

  // private headerValuesSource = new BehaviorSubject<TableCell[]>([]);
  // private pageNumberSource = new BehaviorSubject<number>(1);
  // private itemsPerPageSource = new BehaviorSubject<number>(100);


  constructor() { }

  ngOnInit() {
  }

}
