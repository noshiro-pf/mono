import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SelectorOption } from '../types/selector-option';
import { HeaderSetting } from '../types/header-setting';

@Component({
  selector: 'app-header-cell',
  templateUrl: './header-cell.component.html',
})
export class HeaderCellComponent implements OnInit {

  @Input() headerSetting: HeaderSetting = new HeaderSetting();
  @Input() selectorOptions: SelectorOption[];

  @Input() headerValue: any = '';
  @Output() headerValueChange = new EventEmitter<any>();


  constructor() { }

  ngOnInit() {
    this.headerSetting = this.headerSetting || new HeaderSetting();
    this.selectorOptions = this.selectorOptions || [];
    this.headerValue = this.headerValue || '';
  }

  changeHeaderValue( value: any|undefined ) {
    this.headerValueChange.emit( value );
  }

  resetOnClick() {
    this.changeHeaderValue( undefined );
  }
}
