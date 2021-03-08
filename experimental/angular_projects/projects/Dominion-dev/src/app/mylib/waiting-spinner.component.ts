import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-waiting-spinner',
  template: `
    <div *ngIf="waiting" class="waiting-spinner">
      <mat-spinner strokeWidth="6" diameter="48"></mat-spinner>
    </div>
  `,
  styles: [
    `
      .waiting-spinner {
        margin: 10px;
      }
    `,
  ],
})
export class WaitingSpinnerComponent implements OnInit {
  @Input() readonly waiting: boolean = true;

  constructor() {}

  ngOnInit() {}
}
