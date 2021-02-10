import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-password-dialog',
  template: `
    <!-- message -->
    <div mat-dialog-content>
      パスワードを入力してください。
      <div class="margined-element">
        <mat-form-field>
          <input matInput placeholder="Password"
              name="eventPassword"
              autocomplete="off"
              [value]="password || ''"
              (input)="passwordChange( $event.target.value )"
              required>
        </mat-form-field>
      </div>
    </div>

    <!-- buttons -->
    <div mat-dialog-actions class="actionButtons">
      <span class="margined-element">
        <button mat-raised-button
          mat-dialog-close="yes"
          [disabled]="passwordAnswer !== password"
          color='primary'>
          OK
        </button>
      </span>
      <span class="margined-element">
        <button mat-raised-button
          mat-dialog-close="no">
          Cancel
        </button>
      </span>
    </div>
  `,
  styles: [` .actionButtons { justify-content: center; } `]
})
export class EditPasswordDialogComponent implements OnInit {

  message!: string;  // input
  passwordAnswer!: string;  // input
  password!: string;

  constructor() { }

  ngOnInit() {
  }

  passwordChange( value: string ) {
    this.password = value;
  }

}
