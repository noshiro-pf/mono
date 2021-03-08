import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { DatabaseService } from '../../../database/database.service';
import { ConfirmDialogComponent } from '../../../mylib/confirm-dialog.component';
import { Answer, Schedule, ScheduleSymbol } from '../scheduling-event';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
})
export class EditEventComponent implements OnInit {
  scEventId$!: Observable<string>;

  title: string = '';
  notes: string = '';
  selectedDatetimes: number[] = [];
  answerDeadline: number = Date.now();
  symbols: ScheduleSymbol[] = [];
  password: string = '';
  answers: Answer[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private database: DatabaseService
  ) {}

  ngOnInit() {
    this.scEventId$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => params.getAll('eventId'))
    );

    const scEvent$: Observable<Schedule> = combineLatest(
      this.scEventId$,
      this.database.schedulingEvents$,
      (eventId, list) =>
        list.find((e) => e.databaseKey === eventId) || new Schedule()
    );

    const scEventFirst$ = scEvent$.pipe(first());

    scEventFirst$.subscribe((scEvent) => {
      this.title = scEvent.title;
      this.notes = scEvent.notes;
      this.selectedDatetimes = scEvent.selectedDatetimes;
      this.answerDeadline = scEvent.answerDeadline;
      this.symbols = scEvent.symbols;
      this.password = scEvent.password;
      this.answers = scEvent.answers;
      console.log(scEvent);
    });
  }

  /* callback functions */
  titleChange(title: string) {
    this.title = title;
  }
  notesChange(notes: string) {
    this.notes = notes;
  }
  selectedDatetimesChange(value: number[]) {
    this.selectedDatetimes = value;
  }
  answerDeadlineChange(value: number) {
    this.answerDeadline = value;
  }
  symbolsChange(value: ScheduleSymbol[]) {
    this.symbols = value;
  }
  passwordChange(value: string) {
    this.password = value;
  }

  removePastDates() {
    const newValue = this.selectedDatetimes.filter((e) => e >= Date.now());
    this.selectedDatetimes = newValue;
  }

  exit(scEventId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message =
      '更新を破棄して回答ページへ戻ります。よろしいですか？';
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
      this.answers.forEach((ans) => {
        ans.selection = ans.selection.filter((sl) =>
          this.selectedDatetimes.includes(sl.date)
        );
      });

      /* add default selection to answers for added dates */
      this.selectedDatetimes.forEach((date) => {
        this.answers.forEach((ans) => {
          if (!ans.selection.map((e) => e.date).includes(date)) {
            ans.selection.push({ date: date, symbolID: '' });
          }
        });
      });

      const scEvent = new Schedule(scEventId, {
        answerDeadline: this.answerDeadline,
        answers: this.answers,
        notes: this.notes,
        password: this.password,
        selectedDatetimes: this.selectedDatetimes,
        symbols: this.symbols,
        title: this.title,
      });

      console.log(scEvent);

      this.database.scheduling.setEvent(scEventId, scEvent);
      this.router.navigate([`scheduling/answer/${scEventId}`]);
    });
  }
}
