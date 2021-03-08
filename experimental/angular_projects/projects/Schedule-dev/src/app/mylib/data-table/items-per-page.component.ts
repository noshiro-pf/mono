import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { manual } from 'rnjs';

@Component({
  selector: 'app-items-per-page',
  template: `
    <ng-container
      *ngIf="{
        options: options$ | async,
        itemsPerPage: itemsPerPage$ | async
      } as data"
    >
      <mat-form-field class="items-per-page">
        <mat-select placeholder="items per page" [value]="data.itemsPerPage">
          <mat-option
            *ngFor="let option of data.options"
            [value]="option"
            (click)="setItemsPerPage(option)"
          >
            {{ option }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <ng-container> </ng-container
    ></ng-container>
  `,
  styles: [
    `
      .items-per-page {
        padding: 20px;
        display: inline-block;
      }
    `,
  ],
})
export class ItemsPerPageComponent implements OnInit {
  readonly options$ = manual<number[]>([25, 50, 100, 200]);
  @Input() set options(value: number[]) {
    this.options$.emit(value || [25, 50, 100, 200]);
  }

  readonly itemsPerPage$ = manual<number>(50);
  @Input() set itemsPerPage(value: number) {
    this.itemsPerPage$.emit(value || 50);
  }

  @Output() itemsPerPageChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {}

  setItemsPerPage(value: number) {
    this.itemsPerPageChange.emit(value);
  }
}
