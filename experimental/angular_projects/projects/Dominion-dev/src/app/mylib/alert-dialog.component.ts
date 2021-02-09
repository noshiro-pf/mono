import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert-dialog',
  template: `
    <!-- message -->
    <div mat-dialog-content>
      {{message}}
    </div>

    <!-- buttons -->
    <div mat-dialog-actions class="action-buttons">
      <span class="margined-element">
        <button mat-raised-button
          mat-dialog-close="yes"
          color='primary'>
          OK
        </button>
      </span>
    </div>
  `,
  styles: [` .action-buttons { justify-content: center; } `]
})
export class AlertDialogComponent implements OnInit {

  message!: string;  // input

  constructor() {}

  ngOnInit() {
  }

}
