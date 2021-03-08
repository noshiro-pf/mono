import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { manual } from 'rnjs';
import { HeaderSetting } from '../types/header-setting';
import { SelectorOption } from '../types/selector-option';

@Component({
  selector: 'app-header-cell',
  templateUrl: './header-cell.component.html',
})
export class HeaderCellComponent implements OnInit {
  readonly headerSettings$ = manual<HeaderSetting>(new HeaderSetting());
  @Input() set headerSetting(value: HeaderSetting) {
    this.headerSettings$.emit(value || new HeaderSetting());
  }

  readonly selectorOptions$ = manual<SelectorOption[]>([]);
  @Input() set selectorOptions(value: SelectorOption[]) {
    this.selectorOptions$.emit(value || []);
  }

  readonly headerValue$ = manual<any>('');
  @Input() set headerValue(value: any) {
    this.headerValue$.emit(value || '');
  }

  @Output() headerValueChange = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  changeHeaderValue(value: any | undefined) {
    this.headerValue$.emit(value);
    this.headerValueChange.emit(value);
  }

  resetOnClick() {
    this.changeHeaderValue(undefined);
  }
}
