import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { utils } from '../utilities';

@Component({
  selector: 'app-multiple-date-picker',
  templateUrl: './multiple-date-picker.component.html',
  styleUrls: ['./multiple-date-picker.component.css'],
})
export class MultipleDatePickerComponent implements OnInit {
  @Input() readonly width: number = 300;
  @Input() readonly filterFn = (value: any) => true;
  @Input() readonly dayLabelLanguage: 'eng' | 'jp' = 'eng';

  private selectedDateValuesSource = new BehaviorSubject<number[]>([]);
  private selectedDateValues$: Observable<number[]> =
    this.selectedDateValuesSource.asObservable();

  @Input() set initialDateList(value: number[]) {
    const initialDateValuesUniq = utils.array.uniq(
      value.map((e) => utils.date.toMidnightTimestamp(e))
    );
    this.selectedDateValuesSource.next(initialDateValuesUniq);
  }

  @Output() selectedDatesChange = new EventEmitter<number[]>();

  dayStrings!: string[];
  weeks$: Observable<{ date: Date; selected: boolean }[][]>;

  private currentYearSource = new BehaviorSubject<number>(
    new Date().getFullYear()
  );
  private currentMonthSource = new BehaviorSubject<number>(
    new Date().getMonth()
  );
  currentYear$: Observable<number> = this.currentYearSource.asObservable();
  currentMonth$: Observable<number> = this.currentMonthSource.asObservable();

  constructor() {
    this.weeks$ = combineLatest(
      this.currentYear$,
      this.currentMonth$,
      this.selectedDateValues$,
      (year, month, selectedDates) => {
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
      }
    );
  }

  ngOnInit() {
    switch (this.dayLabelLanguage) {
      case 'jp':
        this.dayStrings = ['日', '月', '火', '水', '木', '金', '土'];
        break;

      case 'eng':
        this.dayStrings = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];
        break;
    }
  }

  goToPreviousMonth() {
    if (this.currentMonthSource.getValue() > 0) {
      this.currentMonthSource.next(this.currentMonthSource.getValue() - 1);
    } else {
      this.currentMonthSource.next(11);
      this.currentYearSource.next(this.currentYearSource.getValue() - 1);
    }
  }

  goToNextMonth() {
    if (this.currentMonthSource.getValue() < 11) {
      this.currentMonthSource.next(this.currentMonthSource.getValue() + 1);
    } else {
      this.currentMonthSource.next(0);
      this.currentYearSource.next(this.currentYearSource.getValue() + 1);
    }
  }

  goToToday() {
    this.currentMonthSource.next(new Date().getMonth());
    this.currentYearSource.next(new Date().getFullYear());
  }

  isToday(date: Date) {
    if (!date) return false;
    return utils.date.isToday(date);
  }

  resetSelections() {
    this.selectedDateValuesSource.next([]);
    this.selectedDatesChange.emit([]);
  }

  dateOnSelectToggle(date: Date) {
    if (!date) return;
    if (!this.filterFn(date)) return;
    const current = this.selectedDateValuesSource.getValue();
    if (current.includes(date.getTime())) {
      utils.array.removeValue(current, date.getTime());
    } else {
      current.push(date.getTime());
    }
    this.selectedDateValuesSource.next(current);
    this.selectedDatesChange.emit(current);
  }

  selectToggleDayColumn(dayIndex: number) {
    const current = this.selectedDateValuesSource.getValue();
    const month = this.currentMonthSource.getValue();
    const year = this.currentYearSource.getValue();

    const datesOfDayColumn = utils.date
      .getAllDatesIn(year, month)
      .filter((date: Date) => date.getDay() === dayIndex)
      .filter(this.filterFn);
    const datesInColumnAllSelected = datesOfDayColumn.every((e) =>
      current.includes(e.getTime())
    );

    datesOfDayColumn.forEach((date) =>
      utils.array.remove(current, date.getTime())
    );
    if (!datesInColumnAllSelected) {
      datesOfDayColumn.forEach((date) => current.push(date.getTime()));
    }
    current.sort((x, y) => x - y);
    this.selectedDateValuesSource.next(current);
    this.selectedDatesChange.emit(current);
  }
}
