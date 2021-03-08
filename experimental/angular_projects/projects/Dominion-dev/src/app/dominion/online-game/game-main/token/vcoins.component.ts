import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { utils } from '../../../../mylib/utilities';

@Component({
  selector: 'app-vcoins',
  template: `
    <ng-container
      *ngIf="{
        number: number$ | async,
        indice: indice$ | async
      } as data"
    >
      <div class="vcoins" *ngIf="data.number > 0">
        <ng-container *ngFor="let _ of data.indice">
          <app-vcoin
            class="vcoin"
            [diameter]="diameter"
            [isButton]="isButton"
            (click)="clicked()"
          >
          </app-vcoin>
        </ng-container>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .vcoins {
        display: inline-flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        padding: 3px;
      }
      .vcoin {
        padding: 2px;
      }
    `,
  ],
})
export class VcoinsComponent implements OnInit {
  @Input() diameter: number = 24;
  @Input() number$!: Observable<number>;
  @Input() isButton: boolean = false;
  @Output() click = new EventEmitter<void>();

  indice$!: Observable<number[]>;

  constructor() {}

  ngOnInit() {
    this.indice$ = this.number$.pipe(map((n) => utils.number.seq0(n)));
  }

  clicked() {
    if (this.isButton) this.click.emit();
  }
}
