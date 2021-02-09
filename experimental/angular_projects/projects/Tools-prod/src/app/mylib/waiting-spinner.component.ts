import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-waiting-spinner',
  template: `
    <div *ngIf="!done" class="waiting-spinner">
      <mat-spinner strokeWidth="6" diameter="48" ></mat-spinner>
    </div>
  `,
  styles: [`.waiting-spinner { margin: 10px; }`],
})
export class WaitingSpinnerComponent implements OnInit {

  @Input() readonly done: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
