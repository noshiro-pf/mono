import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, Sort } from '@angular/material';
import { RN, manual } from 'rnjs';
import { AlertDialogComponent } from '../../../mylib/alert-dialog.component';
import { utils } from '../../../mylib/utilities';
import { Answer, Schedule, ScheduleSymbol } from '../../schedule-event';

@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './spreadsheet.component.css',
  ],
})
export class SpreadsheetComponent implements OnInit {
  flipTableState = false;
  selectedDatetimesAfterSort!: number[];

  readonly scEvent$ = manual<Schedule>(new Schedule());
  @Input() set scEvent(value: Schedule) {
    this.scEvent$.emit(value);
    this.selectedDatetimesAfterSort = value.selectedDatetimes;

    if (value.answers.length > 3 * value.selectedDatetimes.length) {
      this.flipTableState = true;
    }
  }

  readonly answerDeadlineExpired$ = manual<boolean>(false);
  @Input() set answerDeadlineExpired(value: boolean) {
    this.answerDeadlineExpired$.emit(value);
  }

  @Output() answerIdChange = new EventEmitter<string>();

  readonly spreadSheet$: RN<object> = this.scEvent$.map((event) => {
    const symbolIds = event.symbols.filter((e) => e.useThis).map((e) => e.id);
    const dates = event.selectedDatetimes;
    const spreadSheet: any = {};
    dates.forEach((date) => {
      spreadSheet[date] = {};
      symbolIds.forEach((id) => (spreadSheet[date][id] = 0));
    });
    event.answers.forEach((answer) =>
      answer.selection.forEach((val) => {
        if (!!spreadSheet[val.date]) {
          spreadSheet[val.date][val.symbolID]++;
        }
      }),
    );
    return spreadSheet;
  });

  readonly toYMD = utils.date.toYMD;
  readonly getDayStringJp = utils.date.getDayStringJp;
  readonly toHM = utils.date.toHM;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  flipTable() {
    this.flipTableState = !this.flipTableState;
  }

  /* for print */
  getAverageScore(event: Schedule, date: number) {
    const symbolIdsOfDate = event.answers
      .map((ans) => ans.selection.find((e) => e.date === date))
      .filter((e) => e !== undefined)
      .map((e) => (e || { symbolID: '' }).symbolID);
    const scores = symbolIdsOfDate.map(
      (id) => (event.symbols.find((e) => e.id === id) || { score: 0 }).score,
    );
    return utils.number.roundAt(utils.array.average(scores), 1) || 0;
  }

  /* for print */
  getIconNameOfAnswer(
    answer: Answer,
    date: number,
    symbols: ScheduleSymbol[],
  ): string {
    const selection = answer.selection.find((e) => e.date === date);
    if (!selection) return '';
    const symbol = symbols.find((e) => e.id === selection.symbolID);
    return !!symbol ? symbol.iconName : '';
  }

  commentOnClick(comment: string) {
    const dialogRef = this.dialog.open(AlertDialogComponent);
    dialogRef.componentInstance.message = comment;
  }

  userClicked(answer: Answer) {
    this.answerIdChange.emit(answer.databaseKey);
  }

  sortData(sort: Sort, scEvent: Schedule, spreadSheet: any) {
    const selectedDatetimesRaw = scEvent.selectedDatetimes.slice();
    const isAsc = sort.direction === 'asc';

    if (!sort.active || sort.direction === '') {
      this.selectedDatetimesAfterSort = selectedDatetimesRaw;
      return;
    }

    switch (sort.active) {
      case 'date':
        if (isAsc) {
          this.selectedDatetimesAfterSort = selectedDatetimesRaw;
        } else {
          this.selectedDatetimesAfterSort = selectedDatetimesRaw.reverse();
        }
        break;
      case 'score':
        this.selectedDatetimesAfterSort = selectedDatetimesRaw.sort(
          (a, b) =>
            (isAsc ? 1 : -1) *
            (this.getAverageScore(scEvent, a) -
              this.getAverageScore(scEvent, b)),
        );
        break;
      case 'fav':
      case 'ok':
      case 'maybe':
      case 'depends':
      case 'late':
      case 'unknown':
      case 'ng':
      case 'kusonemi':
        this.selectedDatetimesAfterSort = selectedDatetimesRaw.sort(
          (a, b) =>
            (isAsc ? 1 : -1) *
            (spreadSheet[a][sort.active] - spreadSheet[b][sort.active]),
        );
        break;
      default:
        return 0;
    }
  }
}
