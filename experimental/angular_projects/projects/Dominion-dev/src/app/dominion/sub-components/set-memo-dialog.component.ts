import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-set-memo-dialog',
  template: `
    <div mat-dialog-content>
      <mat-form-field>
        <textarea
          matInput
          placeholder="Memo"
          [value]="newMemo || ''"
          (input)="changeMemo($event.target.value)"
        >
        </textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions class="action-buttons">
      <span class="margined-element">
        <button mat-raised-button [mat-dialog-close]="newMemo" color="primary">
          OK
        </button>
      </span>
      <span class="margined-element">
        <button mat-raised-button [mat-dialog-close]="undefined">Cancel</button>
      </span>
    </div>
  `,
  styles: [],
})
export class SetMemoDialogComponent implements OnInit {
  memo!: string; // input
  newMemo: string = '';

  constructor() {}

  ngOnInit() {
    this.newMemo = this.memo;
  }

  changeMemo(value: string) {
    this.newMemo = value;
  }
}
