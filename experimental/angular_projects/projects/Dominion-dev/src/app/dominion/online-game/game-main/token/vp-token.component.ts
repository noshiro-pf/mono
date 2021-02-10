import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-vp-token',
  template: `
    <img src="assets/img/game-object/VP.png"
      width="auto" [style.height.px]="diameter">
  `,
  styles: []
})
export class VpTokenComponent implements OnInit {

  @Input() diameter: number = 24;

  constructor() { }
  ngOnInit() {}
}

