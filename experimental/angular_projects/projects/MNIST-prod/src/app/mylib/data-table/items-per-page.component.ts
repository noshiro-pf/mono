import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-items-per-page',
  template: `
    <mat-form-field class='items-per-page'>
      <mat-select placeholder="items per page" [value]="itemsPerPage">
        <mat-option *ngFor="let option of options"
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

  @Input() options!: number[];
  @Input()  itemsPerPage!: number;
  @Output() itemsPerPageChange = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit() {
    this.itemsPerPage = ( this.itemsPerPage || 50 );
    this.options = ( this.options || [ 25, 50, 100, 200 ] );
  }

  setItemsPerPage( value: number ) {
    this.itemsPerPageChange.emit( value );
  }
}
