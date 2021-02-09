import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-message-dialog',
  template: `
    <div mat-dialog-content>
      {{message}}
    </div>
  `,
  styles: []
})
export class MessageDialogComponent implements OnInit {

  message!: string;  // input

  constructor() { }

  ngOnInit() {
  }

}
