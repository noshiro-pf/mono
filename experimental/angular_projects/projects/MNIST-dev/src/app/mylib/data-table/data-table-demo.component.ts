import { Component, OnInit } from '@angular/core';
import { utils } from '../utilities';
import { TableSettings } from './types/table-settings';

@Component({
  selector: 'app-data-table-demo',
  template: `
    <div class="margined-element">
      <app-data-table
        [table]="table"
        [settings]="settings"
        (clickedCellPosition)="cellOnClick($event)"
        (tableFilteredIndexedChange)="tableFilteredIndexedOnChange($event)"
      >
      </app-data-table>
    </div>
  `,
})
export class DataTableDemoComponent implements OnInit {
  private alph = utils.string.getAlphabets('lower');

  table: any[][] = utils.number.seq0(100).map(() => {
    const randomAlphabets = this.alph.filter(() => Math.random() >= 0.5);
    return [
      utils.number.random.getShuffled(randomAlphabets).join(''),
      // randomAlphabets.join(''),
      randomAlphabets,
      randomAlphabets.length,
    ];
  });

  settings = new TableSettings({
    usepagination: true,
    displayNo: true,
    itemsPerPageInit: 25,
    itemsPerPageOptions: [10, 20, 25, 50, 100],
    headerSettings: [
      {
        displayName: 'alphabets',
        filterType: 'input',
        sort: true,
        isButton: true,
      },
      {
        displayName: 'alphabets set',
        filterType: 'multiSelect-and',
        sort: true,
        isButton: true,
      },
      {
        displayName: 'length',
        filterType: 'select',
        sort: true,
        compareFn: (x: any, y: any) => Number(x) - Number(y),
      },
    ],
  });

  constructor() {}

  ngOnInit() {}

  cellOnClick(event: any) {
    console.log(event);
  }

  tableFilteredIndexedOnChange(event: any) {
    console.log(event);
  }
}
