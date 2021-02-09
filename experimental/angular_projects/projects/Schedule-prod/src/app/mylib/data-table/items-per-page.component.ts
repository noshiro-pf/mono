import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table--items-per-page',
  template: `
    <mat-form-field class='items-per-page'>
      <mat-select placeholder="items per page" [value]="itemsPerPage">
        <mat-option *ngFor="let option of itemsPerPageOptions"
            [value]="option"
            (click)="setItemsPerPage( option )" >
          {{ option }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .items-per-page {
      padding: 20px;
      display: inline-block;
    }
  `]
})
export class ItemsPerPageComponent implements OnInit {

  @Input() readonly itemsPerPageOptions: number[] = [];  // [ 25, 50, 100, 200 ];

  @Input() readonly itemsPerPage: number = 0;
  @Output() itemsPerPageChange = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit() {
  }

  setItemsPerPage( value: number ) {
    this.itemsPerPageChange.emit( value );
  }
}
