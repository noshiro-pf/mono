import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ScheduleSymbol } from '../../schedule-event';

@Component({
  selector: 'app-symbol-settings',
  templateUrl: './symbol-settings.component.html',
  styleUrls: ['./symbol-settings.component.css'],
})
export class SymbolSettingsComponent implements OnInit {
  symbols!: ScheduleSymbol[];
  defaultSymbols: ScheduleSymbol[] = [];
  optionalSymbols: ScheduleSymbol[] = [];

  @Input() set symbolsInit(value: ScheduleSymbol[]) {
    this.symbols = value.slice(); // copy
    this.defaultSymbols = this.symbols.filter((e) =>
      e.id.match(/^(ok|maybe|ng)$/),
    );
    this.optionalSymbols = this.symbols.filter(
      (e) => !e.id.match(/^(ok|maybe|ng)$/),
    );
  }
  @Output() symbolsChange = new EventEmitter<ScheduleSymbol[]>();

  constructor() {}

  ngOnInit() {}

  symbolChecked(id: string, value: boolean) {
    (this.symbols.find((e) => e.id === id) || { useThis: false }).useThis =
      value;
    this.symbolsChange.emit(this.symbols);
  }

  symbolDescriptionChange(id: string, value: string) {
    (this.symbols.find((e) => e.id === id) || { description: '' }).description =
      value;
    this.symbolsChange.emit(this.symbols);
  }

  symbolScoreChange(id: string, value: number) {
    (this.symbols.find((e) => e.id === id) || { score: 0 }).score = value;
    this.symbolsChange.emit(this.symbols);
  }
}
