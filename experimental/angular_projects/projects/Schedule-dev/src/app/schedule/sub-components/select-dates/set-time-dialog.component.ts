import { Component, OnInit } from '@angular/core';
import { utils } from '../../../mylib/utilities';

@Component({
  selector: 'app-set-time-dialog',
  template: `
    <div mat-dialog-content>
      <mat-form-field class="hours-selector">
        <mat-select placeholder="hours" [(value)]="selectedHours">
          <mat-option *ngFor="let hours of hoursList" [value]="hours">
            {{ hours }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      :
      <mat-form-field class="minutes-selector">
        <mat-select placeholder="minutes" [(value)]="selectedMinutes">
          <mat-option *ngFor="let minutes of minutesList" [value]="minutes">
            {{ minutes }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div mat-dialog-actions class="actionButtons">
      <span class="margined-element">
        <button
          mat-raised-button
          [mat-dialog-close]="{
            clicked: 'ok',
            hours: selectedHours,
            minutes: selectedMinutes
          }"
          color="primary"
        >
          OK
        </button>
      </span>
      <span class="margined-element">
        <button mat-raised-button [mat-dialog-close]="{ clicked: 'cancel' }">
          Cancel
        </button>
      </span>
    </div>
  `,
  styles: [
    `
      .actionButtons {
        justify-content: center;
      }
      .hours-selector,
      .minutes-selector {
        width: 50px;
      }
    `,
  ],
})
export class SetTimeDialogComponent implements OnInit {
  hoursList = utils.number.seq0(24);
  minutesList = utils.number.seq0(6).map((e) => 10 * e);

  selectedHours = 0;
  selectedMinutes = 0;

  hoursInit!: number; // input
  minutesInit!: number; // input

  constructor() {}

  ngOnInit() {
    this.selectedHours = this.hoursInit;
    this.selectedMinutes = this.minutesInit;
  }
}
