import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RN, manual, merge } from 'rnjs';
import { utils } from '../../../mylib/utilities';
import { getAddedDates, getRemovedDates, to0000 } from './functions';
import { SetTimeDialogComponent } from './set-time-dialog.component';

@Component({
  selector: 'app-select-dates',
  templateUrl: './select-dates.component.html',
  styleUrls: ['./select-dates.component.css'],
})
export class SelectDatesComponent implements OnInit {
  defaultHour: number = 19;
  defaultMinutes: number = 0;

  @Output() selectedDatetimesChange = new EventEmitter<number[]>();

  private selectedDatetimesSource$ = manual<number[]>([]);
  @Input() set selectedDatetimesInit(value: number[]) {
    // this.selectedDatetimes = (value || []).slice(); // copy
    this.selectedDatetimesSource$.emit((value || []).slice());
  }

  // private removeDatesSource$ = manual<number[]>([]);
  // private addDatesSource$ = manual<number[]>([]);
  private updateDatesSource$ = manual<{ remove: number[]; add: number[] }>({
    remove: [],
    add: [],
  });

  /** example
   * [ 2017/10/27 12:00,
   *   2017/10/27 19:00
   *   2017/10/28 13:00,
   *   2017/10/28 18:00,
   *   2017/10/28 20:00 ]
   **/
  selectedDatetimes$: RN<number[]> = merge(
    this.selectedDatetimesSource$.map((e) => ({ value: e, id: 'input' })),
    this.updateDatesSource$.map((e) => ({ value: e, id: 'update' })),
  ).scan([] as number[], (state, curr) => {
    const initializer = curr.value as number[];
    const remove_add = curr.value as { remove: number[]; add: number[] };
    switch (curr.id) {
      case 'input':
        state = initializer;
        break;
      case 'update':
        state = state.filter((e) => !remove_add.remove.includes(e));
        utils.array.pushValues(state, remove_add.add);
        break;
    }
    state = state.sort();
    return state;
  });

  toYMD = utils.date.toYMD;
  toHM = utils.date.toHM;
  getDayStringEng = utils.date.getDayStringEng;

  pad2 = (minutes: number) => minutes.toString().padStart(2, '0');

  sinceToday = (date: number): boolean =>
    !date ? false : to0000(date) >= to0000(Date.now());

  constructor(public dialog: MatDialog) {
    this.selectedDatetimes$.listen(false, (v) =>
      this.selectedDatetimesChange.emit(v),
    );
  }

  ngOnInit() {}

  private toDefaultTime(datetime: number): number {
    const date = new Date(datetime);
    date.setHours(this.defaultHour);
    date.setMinutes(this.defaultMinutes);
    return date.getTime();
  }

  datePickerOnChange(datetimes: number[]) {
    const datetimesOld = this.selectedDatetimes$.value;
    const datetimesNew = datetimes;
    const removedDates = getRemovedDates(datetimesOld, datetimesNew);
    const addedDates = getAddedDates(datetimesOld, datetimesNew);
    const removedDatetimes = datetimesOld.filter((e) =>
      removedDates.includes(to0000(e)),
    );
    const addedDatetimes = addedDates.map((d) => this.toDefaultTime(d));

    this.updateDatesSource$.emit({
      remove: removedDatetimes,
      add: addedDatetimes,
    });
  }

  changeTimeAll() {
    const dialogRef = this.dialog.open(SetTimeDialogComponent, {
      disableClose: true,
    });

    // input
    dialogRef.componentInstance.hoursInit = this.defaultHour;
    dialogRef.componentInstance.minutesInit = this.defaultMinutes;

    dialogRef.afterClosed().subscribe((value) => {
      if (value.clicked !== 'ok') return;
      /* default */
      this.defaultHour = value.hours;
      this.defaultMinutes = value.minutes;

      /* reset all datetimes */
      this.updateDatesSource$.emit({
        remove: this.selectedDatetimes$.value,
        add: this.selectedDatetimes$.value.map((d) => this.toDefaultTime(d)),
      });
    });
  }

  changeTime(target: number) {
    const dialogRef = this.dialog.open(SetTimeDialogComponent, {
      disableClose: true,
    });

    // dialog input
    dialogRef.componentInstance.hoursInit = new Date(target).getHours();
    dialogRef.componentInstance.minutesInit = new Date(target).getMinutes();

    dialogRef.afterClosed().subscribe((value) => {
      if (value.clicked !== 'ok') return;

      const date = new Date(target);
      date.setHours(value.hours);
      date.setMinutes(value.minutes);
      this.updateDatesSource$.emit({
        remove: [target],
        add: [date.getTime()],
      });
    });
  }

  copy(datetime: number) {
    const date = new Date(datetime);
    date.setHours(date.getHours() + 1);
    this.updateDatesSource$.emit({ remove: [], add: [date.getTime()] });
  }

  remove(datetime: number) {
    this.updateDatesSource$.emit({ add: [], remove: [datetime] });
  }
}
