import { Component, OnInit } from '@angular/core';
import { MatDialog, MatStepper } from '@angular/material';
import { DatabaseService } from '../../database/database.service';
import { ConfirmDialogComponent } from '../../mylib/confirm-dialog.component';
import { Schedule, ScheduleSymbol } from './scheduling-event';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.css'],
})
export class SchedulingComponent implements OnInit {
  symbols: ScheduleSymbol[] = [
    {
      id: 'fav',
      useThis: false,
      score: 10,
      iconName: 'favorite',
      description: 'できればこの日で',
    },
    {
      id: 'ok',
      useThis: true,
      score: 10,
      iconName: 'radio_button_unchecked',
      description: '参加可能',
    },
    {
      id: 'maybe',
      useThis: true,
      score: 5,
      iconName: 'change_history',
      description: '行けるかも',
    },
    {
      id: 'depends',
      useThis: false,
      score: 5,
      iconName: 'watch',
      description: '時間によります',
    },
    {
      id: 'late',
      useThis: false,
      score: 5,
      iconName: 'schedule',
      description: '遅れてなら参加可能',
    },
    {
      id: 'unknown',
      useThis: false,
      score: 5,
      iconName: 'help_outline',
      description: '分からない',
    },
    {
      id: 'ng',
      useThis: true,
      score: 0,
      iconName: 'clear',
      description: '参加不可',
    },
    {
      id: 'kusonemi',
      useThis: false,
      score: 0,
      iconName: 'hotel',
      description: '起きられません',
    },
  ];

  newEvent = new Schedule();

  eventPageUrlPrefix = '';
  eventPageId = '';

  constructor(
    public dialog: MatDialog,
    private database: DatabaseService
  ) {}

  ngOnInit() {
    this.eventPageUrlPrefix = window.location.href + '/answer/';
    this.newEvent.symbols = this.symbols.slice();
  }

  /* callback functions */
  titleChange(value: string) {
    this.newEvent.title = value;
  }
  notesChange(value: string) {
    this.newEvent.notes = value;
  }
  selectedDatetimesChange(value: number[]) {
    this.newEvent.selectedDatetimes = value;
  }
  answerDeadlineChange(value: number) {
    this.newEvent.answerDeadline = value;
  }
  symbolsChange(value: ScheduleSymbol[]) {
    this.newEvent.symbols = value;
  }
  passwordChange(value: string) {
    this.newEvent.password = value;
  }

  createEvent(stepper: MatStepper) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message =
      'イベントを作成します。よろしいですか？';
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        const databaseKey =
          this.database.scheduling.addEvent(this.newEvent).key || '';
        this.eventPageId = databaseKey;
        stepper.next();
      }
    });
  }
}
