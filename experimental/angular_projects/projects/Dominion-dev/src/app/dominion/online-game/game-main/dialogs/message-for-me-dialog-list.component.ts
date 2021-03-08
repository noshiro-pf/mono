import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-for-me-dialog-list',
  template: `
    <div mat-dialog-content>
      <div *ngFor="let message of gameMessageList">
        <div>{{ message }}</div>
      </div>
    </div>
    <div mat-dialog-actions class="center">
      <button mat-raised-button mat-dialog-close="yes" color="primary">
        OK
      </button>
    </div>
  `,
  styles: [
    `
      .center {
        justify-content: center;
        display: flex;
        align-items: center;
      }
    `,
  ],
})
export class MessageForMeListDialogComponent implements OnInit {
  gameMessageList: string[] = []; // input
  constructor() {}
  ngOnInit() {}
}
