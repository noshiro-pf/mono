import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RN, combine, manual } from 'rnjs';
import { utils } from '../utilities';

@Component({
  selector: 'app-multiple-date-picker',
  templateUrl: './multiple-date-picker.component.html',
  styleUrls: ['./multiple-date-picker.component.css'],
})
export class MultipleDatePickerComponent implements OnInit {
  @Input() readonly width: number = 300;
  @Input() readonly filterFn = (_: any) => true;

  private readonly dayLabelLanguage$ = manual<'eng' | 'jp'>('eng');

  @Input() set dayLabelLanguage(value: 'eng' | 'jp') {
    if (value === 'eng' || value === 'jp') {
      this.dayLabelLanguage$.emit(value);
    }
  }

  readonly dayStrings$: RN<string[]> = this.dayLabelLanguage$.map((lang) => {
    switch (lang) {
      case 'jp':
        return ['日', '月', '火', '水', '木', '金', '土'];
      case 'eng':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];
    }
  });

  private readonly selectedDateValues$ = manual<number[]>([]);

  @Input() set initialDateList(value: number[]) {
    const initialDateValuesUniq = utils.array.uniq(
      value.map((e) => utils.date.toMidnightTimestamp(e)),
    );
    this.selectedDateValues$.emit(initialDateValuesUniq);
  }

  @Output() selectedDatesChange = new EventEmitter<number[]>();

  readonly currentYear$ = manual<number>(new Date().getFullYear());
  readonly currentMonth$ = manual<number>(new Date().getMonth());

  readonly weeks$: RN<{ date: Date; selected: boolean }[][]> = combine(
    this.currentYear$,
    this.currentMonth$,
    this.selectedDateValues$,
  ).map(([year, month, selectedDates]) => {
    const weeks: { date: Date; selected: boolean }[][] = [];
    utils.date.getAllDatesIn(year, month).forEach((date: Date) => {
      const weekNumber = utils.date.weekNumber(date);
      if (weeks.length < weekNumber + 1) {
        weeks.push(Array(7).fill({ date: undefined, selected: false }));
      }
      weeks[weekNumber][date.getDay()] = {
        date: date,
        selected: selectedDates.includes(date.getTime()),
      };
    });
    return weeks;
  });

  constructor() {}

  ngOnInit() {}

  goToPreviousMonth() {
    if (this.currentMonth$.value > 0) {
      this.currentMonth$.emit(this.currentMonth$.value - 1);
    } else {
      this.currentMonth$.emit(11);
      this.currentYear$.emit(this.currentYear$.value - 1);
    }
  }

  goToNextMonth() {
    if (this.currentMonth$.value < 11) {
      this.currentMonth$.emit(this.currentMonth$.value + 1);
    } else {
      this.currentMonth$.emit(0);
      this.currentYear$.emit(this.currentYear$.value + 1);
    }
  }

  goToToday() {
    this.currentMonth$.emit(new Date().getMonth());
    this.currentYear$.emit(new Date().getFullYear());
  }

  isToday(date: Date) {
    if (!date) return false;
    return utils.date.isToday(date);
  }

  resetSelections() {
    this.selectedDateValues$.emit([]);
    this.selectedDatesChange.emit([]);
  }

  dateOnSelectToggle(date: Date) {
    if (!date) return;
    if (!this.filterFn(date)) return;
    const current = this.selectedDateValues$.value;
    if (current.includes(date.getTime())) {
      utils.array.removeValue(current, date.getTime());
    } else {
      current.push(date.getTime());
    }
    this.selectedDateValues$.emit(current);
    this.selectedDatesChange.emit(current);
  }

  selectToggleDayColumn(dayIndex: number) {
    const current = this.selectedDateValues$.value;
    const month = this.currentMonth$.value;
    const year = this.currentYear$.value;

    const datesOfDayColumn = utils.date
      .getAllDatesIn(year, month)
      .filter((date: Date) => date.getDay() === dayIndex)
      .filter(this.filterFn);
    const datesInColumnAllSelected = datesOfDayColumn.every((e) =>
      current.includes(e.getTime()),
    );

    datesOfDayColumn.forEach((date) =>
      utils.array.remove(current, date.getTime()),
    );
    if (!datesInColumnAllSelected) {
      datesOfDayColumn.forEach((date) => current.push(date.getTime()));
    }
    current.sort((x, y) => x - y);
    this.selectedDateValues$.emit(current);
    this.selectedDatesChange.emit(current);
  }
}
