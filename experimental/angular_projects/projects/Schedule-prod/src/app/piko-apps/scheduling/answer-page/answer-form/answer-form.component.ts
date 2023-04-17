import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  combineLatest,
} from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { DatabaseService } from '../../../../database/database.service';
import { ConfirmDialogComponent } from '../../../../mylib/confirm-dialog.component';
import { utils } from '../../../../mylib/utilities';
import { Answer, Schedule } from '../../scheduling-event';

@Component({
  selector: 'app-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: [
    '../../../../mylib/data-table/data-table.component.css',
    './answer-form.component.css',
  ],
})
export class AnswerFormComponent implements OnInit, OnDestroy {
  private alive = true;

  @Input() readonly scEventId!: string;

  private scEventSource = new ReplaySubject<Schedule>(1);
  @Input() set scEvent(value: Schedule) {
    this.scEventSource.next(value);
  }
  scEvent$ = this.scEventSource.asObservable();

  private answerIdSource = new ReplaySubject<string>(1);
  @Input() set answerId(value: string) {
    this.answerIdSource.next(value);
  }
  answerId$: Observable<string> = this.answerIdSource.asObservable();

  @Output() answerIdChange = new EventEmitter<string>();

  userName = ''; /* bound to input element */
  comment = ''; /* bound to input element */

  private dateToSymbolIdSource = new BehaviorSubject<object>({});
  dateToSymbolId$ = this.dateToSymbolIdSource.asObservable();
  allDatesSelected$!: Observable<boolean>;

  toYMD = utils.date.toYMD;
  getDayStringEng = utils.date.getDayStringEng;
  toHM = utils.date.toHM;

  constructor(private dialog: MatDialog, private database: DatabaseService) {}

  ngOnInit() {
    this.allDatesSelected$ = this.dateToSymbolId$.pipe(
      map((obj: any) => Object.keys(obj).every((date) => obj[date] !== ''))
    );

    const selectedUsersAnswer$: Observable<Answer> = combineLatest(
      this.answerId$,
      this.scEvent$.pipe(map((e) => e.answers)),
      (answerId, answers) =>
        answers.find((e) => e.databaseKey === answerId) || new Answer()
    );

    /* subscriptions */
    this.scEvent$.pipe(takeWhile(() => this.alive)).subscribe((scEvent) => {
      /* initialize */
      const obj: any = this.dateToSymbolIdSource.value;
      scEvent.selectedDatetimes.forEach((date) => (obj[date] = ''));
      this.dateToSymbolIdSource.next(obj);
    });

    selectedUsersAnswer$
      .pipe(takeWhile(() => this.alive))
      .subscribe((answer) => {
        this.userName = answer.userName;
        this.comment = answer.comment;
        const obj: any = this.dateToSymbolIdSource.value;
        answer.selection.forEach((e) => (obj[e.date] = e.symbolID));
        this.dateToSymbolIdSource.next(obj);
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  userNameOnChange(value: string) {
    this.userName = value;
  }

  commentOnChange(comment: string) {
    this.comment = comment;
  }

  resetForm() {
    this.userName = '';
    this.comment = '';
    this.answerIdChange.emit('');
    const obj: any = this.dateToSymbolIdSource.value;
    Object.keys(obj).forEach((key) => (obj[key] = ''));
    this.dateToSymbolIdSource.next(obj);
  }

  symbolSelected(date: number, symbolID: string) {
    const obj: any = this.dateToSymbolIdSource.value;
    obj[date] = symbolID;
    this.dateToSymbolIdSource.next(obj);
  }

  symbolHeaderSelected(symbolID: string) {
    const obj: any = this.dateToSymbolIdSource.value;
    utils.object.forEach(obj, (_, key, o) => (o[key || ''] = symbolID));
    this.dateToSymbolIdSource.next(obj);
  }

  submitAnswer(answerId: string) {
    const newAnswer = new Answer(undefined, {
      userName: this.userName,
      comment: this.comment,
      selection: utils.object
        .keysAsNumber(this.dateToSymbolIdSource.value)
        .map((key) => ({
          date: key,
          symbolID: (this.dateToSymbolIdSource.value as any)[key],
        })),
    });

    if (answerId === '') {
      this.database.scheduling.addAnswer(this.scEventId, newAnswer);
    } else {
      this.database.scheduling.setAnswer(this.scEventId, answerId, newAnswer);
    }
    this.resetForm();
  }

  deleteAnswer(answerId: string) {
    if (!answerId) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message = '回答を削除しますか？';
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        this.database.scheduling.removeAnswer(this.scEventId, answerId);
        this.resetForm();
      }
    });
  }
}
