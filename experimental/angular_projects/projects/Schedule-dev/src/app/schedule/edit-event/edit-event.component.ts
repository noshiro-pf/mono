import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RN, combine, fromObservable, manual, merge } from 'rnjs';
import { DatabaseService } from '../../database/database.service';
import { ConfirmDialogComponent } from '../../mylib/confirm-dialog.component';
import { Answer, Schedule, ScheduleSymbol } from '../schedule-event';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
})
export class EditEventComponent implements OnInit {
  readonly scEventId$ = manual<string>('');

  private readonly scEventCloud$: RN<Schedule> = combine(
    this.scEventId$,
    this.database.schedulingEvents$
  ).map(
    ([eventId, list]) =>
      list.find((e) => e.databaseKey === eventId) || new Schedule()
  );

  private readonly titleFromUI$ = manual<string>('');
  private readonly notesFromUI$ = manual<string>('');
  private readonly selectedDatetimesFromUI$ = manual<number[]>([]);
  private readonly answerDeadlineFromUI$ = manual<number>(Date.now());
  private readonly symbolsFromUI$ = manual<ScheduleSymbol[]>([]);
  private readonly passwordFromUI$ = manual<string>('');
  private readonly answersFromUI$ = manual<Answer[]>([]);
  private readonly passwordEnabledFromUI$ = manual<boolean>(false);

  readonly title$: RN<string> = merge(
    this.titleFromUI$,
    this.scEventCloud$.pluck('title')
  );

  readonly notes$: RN<string> = merge(
    this.notesFromUI$,
    this.scEventCloud$.pluck('notes')
  );

  readonly selectedDatetimes$: RN<number[]> = merge(
    this.selectedDatetimesFromUI$,
    this.scEventCloud$.pluck('selectedDatetimes')
  );

  readonly answerDeadline$: RN<number> = merge(
    this.answerDeadlineFromUI$,
    this.scEventCloud$.pluck('answerDeadline')
  );

  readonly symbols$: RN<ScheduleSymbol[]> = merge(
    this.symbolsFromUI$,
    this.scEventCloud$.pluck('symbols')
  );

  readonly password$: RN<string> = merge(
    this.passwordFromUI$.debounce(200),
    this.passwordEnabledFromUI$.filter(true, (b) => b === false).mapTo(''),
    this.scEventCloud$.pluck('password')
  );

  readonly answers$: RN<Answer[]> = merge(
    this.answersFromUI$,
    this.scEventCloud$.pluck('answers')
  );

  readonly passwordEnabled$: RN<boolean> = merge(
    this.passwordEnabledFromUI$.debounce(100),
    this.scEventCloud$.pluck('password').map((s) => s !== '')
  );

  readonly updateEventButtonDisabled$: RN<boolean> = combine(
    this.title$,
    this.answerDeadline$,
    this.selectedDatetimes$,
    this.passwordEnabled$,
    this.password$
  )
    .map(
      ([title, answerDeadline, selectedDatetimes, passwordEnabled, password]) =>
        !title ||
        !selectedDatetimes ||
        selectedDatetimes.length === 0 ||
        !answerDeadline ||
        (passwordEnabled && password === '')
    )
    .withInitialValue(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private database: DatabaseService
  ) {}

  ngOnInit() {
    fromObservable({ get: (_: string) => '' } as ParamMap, this.route.paramMap)
      .map((params) => params.get('eventId'))
      .listen(true, (eventId) => this.scEventId$.emit(eventId));
  }

  /* callback functions */
  titleChange(title: string) {
    this.titleFromUI$.emit(title);
  }
  notesChange(notes: string) {
    this.notesFromUI$.emit(notes);
  }
  selectedDatetimesChange(value: number[]) {
    this.selectedDatetimesFromUI$.emit(value);
  }
  answerDeadlineChange(value: number) {
    this.answerDeadlineFromUI$.emit(value);
  }
  symbolsChange(value: ScheduleSymbol[]) {
    this.symbolsFromUI$.emit(value);
  }
  passwordChange(value: string) {
    this.passwordFromUI$.emit(value);
  }

  passwordEnabledChange(value: boolean) {
    this.passwordEnabledFromUI$.emit(value);
  }

  removePastDates() {
    this.selectedDatetimesFromUI$.emit(
      this.selectedDatetimes$.value.filter((e) => e >= Date.now())
    );
  }

  exit(scEventId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message =
      '更新を破棄して回答ページへ戻ります。よろしいですか？';
    dialogRef.componentInstance.OKstr = '破棄して戻る';
    dialogRef.componentInstance.CancelStr = '編集を続ける';
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        this.router.navigate([`scheduling/answer/${scEventId}`]);
      }
    });
  }

  updateEvent(scEventId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message =
      'イベントを更新します。よろしいですか？';
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'yes') return;

      /* remove selection for removed dates from answers */
      const answers = this.answers$.value;
      const selectedDatetimes = this.selectedDatetimes$.value;

      answers.forEach((ans) => {
        ans.selection = ans.selection.filter((sl) =>
          selectedDatetimes.includes(sl.date)
        );
      });

      /* add default selection to answers for added dates */
      selectedDatetimes.forEach((date) => {
        answers.forEach((ans) => {
          if (!ans.selection.map((e) => e.date).includes(date)) {
            ans.selection.push({ date: date, symbolID: '' });
          }
        });
      });

      const scEvent = new Schedule(scEventId, {
        answers: answers,
        selectedDatetimes: selectedDatetimes,
        answerDeadline: this.answerDeadline$.value,
        notes: this.notes$.value,
        password: this.password$.value,
        symbols: this.symbols$.value,
        title: this.title$.value,
      });

      this.database.scheduling.setEvent(scEventId, scEvent);
      this.router.navigate([`scheduling/answer/${scEventId}`]);
    });
  }
}
