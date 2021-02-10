import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-vp-tokens',
  template: `
    <div class="VP-tokens">
      <app-vp-token [diameter]="diameter"></app-vp-token>
      <span class="VPtoken-value"> x {{VPtoken}}</span>
    </div>
  `,
  styles: [`
    .VP-tokens {
      padding: 2px;
      flex-grow: 0;
    }
    .VP-tokens {
      flex-grow: 0;
      display: flex;
      flex-flow: row;
      flex-wrap: nowrap;
      justify-content: center;
      align-items: center;
    }
    .VP-tokens .VPtoken-value {
      padding-left: 3px;
    }
  `]
})
export class VpTokensComponent implements OnInit {

  @Input() diameter: number = 24;
  @Input() VPtoken: number = 0;

  constructor() { }

  ngOnInit() {
  }

}
