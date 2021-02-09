import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SelectorOption } from '../types/selector-option';
import { HeaderSetting } from '../types/header-setting';
import { manual } from 'rnjs';

@Component({
  selector: 'app-header-cell',
  templateUrl: './header-cell.component.html',
})
export class HeaderCellComponent implements OnInit {

  readonly headerSettings$ = manual<HeaderSetting>( new HeaderSetting() );
  @Input() set headerSetting( value: HeaderSetting ) {
    this.headerSettings$.emit( value || new HeaderSetting() );
  }

  readonly selectorOptions$ = manual<SelectorOption[]>([]);
  @Input() set selectorOptions( value: SelectorOption[] ) {
    this.selectorOptions$.emit( value || [] );
  }

  readonly headerValue$ = manual<any>('');
  @Input() set headerValue( value: any ) {
    this.headerValue$.emit( value || '' );
  }

  @Output() headerValueChange = new EventEmitter<any>();


  constructor() { }

  ngOnInit() {
  }

  changeHeaderValue( value: any|undefined ) {
    this.headerValue$.emit( value );
    this.headerValueChange.emit( value );
  }

  resetOnClick() {
    this.changeHeaderValue( undefined );
  }
}
