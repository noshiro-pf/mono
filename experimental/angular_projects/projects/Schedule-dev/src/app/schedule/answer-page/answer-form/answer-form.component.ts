import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RN, combine, manual, merge } from 'rnjs';
import { DatabaseService } from '../../../database/database.service';
import { ConfirmDialogComponent } from '../../../mylib/confirm-dialog.component';
import { utils } from '../../../mylib/utilities';
import { Answer, Schedule } from '../../schedule-event';

@Component({
  selector: 'app-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './answer-form.component.css',
  ],
})
export class AnswerFormComponent implements OnInit {
  @Input() readonly scEventId!: string;

  readonly scEvent$ = manual<Schedule>(new Schedule());
  @Input() set scEvent(value: Schedule) {
    this.scEvent$.emit(value);
  }

  readonly answerId$ = manual<string>('');
  @Input() set answerId(value: string) {
    this.answerId$.emit(value);
  }

  @Output() answerIdChange = new EventEmitter<string>();

  private readonly selectedUsersAnswer$: RN<Answer> = combine(
    this.answerId$,
    this.scEvent$.pluck('answers')
  ).map(
    ([answerId, answers]) =>
      answers.find((e) => e.databaseKey === answerId) || new Answer()
  );

  private readonly userNameInput$ = manual<string>('');
  private readonly commentInput$ = manual<string>('');

  readonly userName$: RN<string> = merge(
    this.userNameInput$.debounce(200),
    this.selectedUsersAnswer$.pluck('userName')
  );

  readonly comment$: RN<string> = merge(
    this.commentInput$.debounce(200),
    this.selectedUsersAnswer$.pluck('comment')
  );

  private readonly selectedDatetimes$: RN<number[]> =
    this.scEvent$.pluck('selectedDatetimes');

  private readonly dateToSymbolIdReset$ = manual<void>(null);
  private readonly dateToSymbolIdSymbolHeaderClick$ = manual<string>(null);
  private readonly dateToSymbolIdSymbolClick$ = manual<{
    date: number;
    symbolId: string;
  }>({ date: 0, symbolId: '' });

  readonly dateToSymbolId$: RN<{ [key: number]: string }> = merge(
    this.selectedDatetimes$.map((dates) => ({
      id: 'initialize',
      value: dates,
    })),
    this.selectedUsersAnswer$.map((answer) => ({
      id: 'selectedUsersAnswer',
      value: answer.selection,
    })),
    this.dateToSymbolIdReset$.mapTo({
      id: 'reset',
      value: 'reset',
    }),
    this.dateToSymbolIdSymbolClick$.map((pair) => ({
      id: 'date-symbol-pair',
      value: pair,
    })),
    this.dateToSymbolIdSymbolHeaderClick$.map((symbolId) => ({
      id: 'set-symbol-column',
      value: symbolId,
    }))
  )
    .withLatest(this.selectedDatetimes$)
    .scan({}, (state: { [key: number]: string }, [curr, datetimes]) => {
      const value = curr.value;
      const id = curr.id;

      switch (id) {
        case 'initialize':
          const initializer = value as number[];
          initializer.forEach((date) => {
            state[date] = '';
          });
          break;
        case 'selectedUsersAnswer':
          const userSelection = value as { date: number; symbolID: string }[];
          userSelection.forEach((v) => {
            state[v.date] = v.symbolID;
          });
          break;
        case 'reset':
          state = {};
          datetimes.forEach((date) => {
            state[date] = '';
          });
          break;
        case 'date-symbol-pair':
          const dateSymbolPair = value as { date: number; symbolId: string };
          state[dateSymbolPair.date] = dateSymbolPair.symbolId;
          break;
        case 'set-symbol-column':
          const symbol = value as string;
          datetimes.forEach((date) => {
            state[date] = symbol;
          });
          break;
      }
      return state;
    });

  readonly allDatesSelected$: RN<boolean> = combine(
    this.selectedDatetimes$,
    this.dateToSymbolId$
  ).map(([selectedDatetimes, dateToSymbolId]) =>
    selectedDatetimes.every((date) => dateToSymbolId[date] !== '')
  );

  readonly toYMD = utils.date.toYMD;
  readonly getDayStringEng = utils.date.getDayStringEng;
  readonly toHM = utils.date.toHM;

  constructor(private dialog: MatDialog, private database: DatabaseService) {}

  ngOnInit() {}

  userNameOnChange(value: string) {
    this.userNameInput$.emit(value);
  }

  commentOnChange(value: string) {
    this.commentInput$.emit(value);
  }

  resetForm() {
    this.userNameInput$.emit('');
    this.commentInput$.emit('');
    this.answerIdChange.emit('');
    this.dateToSymbolIdReset$.emit(null);
  }

  symbolSelected(date: number, symbolId: string) {
    this.dateToSymbolIdSymbolClick$.emit({ date: date, symbolId: symbolId });
  }

  symbolHeaderSelected(symbolId: string) {
    this.dateToSymbolIdSymbolHeaderClick$.emit(symbolId);
  }

  submitAnswer() {
    const dateToSymbolId = this.dateToSymbolId$.value;

    const newAnswer = new Answer(undefined, {
      userName: this.userName$.value,
      comment: this.comment$.value,
      selection: utils.object.keysAsNumber(dateToSymbolId).map((key) => ({
        date: key,
        symbolID: dateToSymbolId[key],
      })),
    });

    const answerId = this.answerId$.value;
    if (answerId === '') {
      this.database.scheduling.addAnswer(this.scEventId, newAnswer);
    } else {
      this.database.scheduling.setAnswer(this.scEventId, answerId, newAnswer);
    }
    this.resetForm();
  }

  deleteAnswer() {
    const answerId = this.answerId$.value;

    if (!answerId) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message = '回答を削除しますか？';
    dialogRef.componentInstance.OKstr = '削除する';
    dialogRef.componentInstance.CancelStr = '削除しない';
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        this.database.scheduling.removeAnswer(this.scEventId, answerId);
        this.resetForm();
      }
    });
  }
}
