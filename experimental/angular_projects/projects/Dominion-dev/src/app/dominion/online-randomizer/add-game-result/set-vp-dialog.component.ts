import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-set-vp-dialog',
  template: `
    <div mat-dialog-content>
      <mat-form-field>
        <input
          matInput
          type="number"
          onclick="this.select(0, this.value.length)"
          [value]="newVP"
          (change)="changeVP($event.target.valueAsNumber)"
        />
      </mat-form-field>
    </div>
    <div mat-dialog-actions class="action-buttons">
      <span class="margined-element">
        <button mat-raised-button [mat-dialog-close]="newVP" color="primary">
          OK
        </button>
      </span>
      <span class="margined-element">
        <button mat-raised-button mat-dialog-close="">Cancel</button>
      </span>
    </div>
  `,
  styles: [],
})
export class SetVpDialogComponent implements OnInit {
  VP!: number; // input
  newVP: number = 0;

  constructor() {}

  ngOnInit() {
    this.newVP = this.VP;
  }

  changeVP(value: number) {
    this.newVP = value;
  }
}
