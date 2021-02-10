import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-debt',
  template: `
    <div [class.button]="isButton" (click)="clicked()">
      <img src="assets/img/game-object/Debt.png"
          [style.height.px]="diameter" width="auto">
    </div>
  `,
  styles: [`
    .button:hover {
      cursor: pointer;
    }
  `]
})
export class DebtComponent implements OnInit {

  @Input() diameter: number = 24;
  @Input() isButton: boolean = false;
  @Output() click = new EventEmitter<void>();

  constructor() {}
  ngOnInit() {}

  clicked() {
    if ( this.isButton ) this.click.emit();
  }
}
