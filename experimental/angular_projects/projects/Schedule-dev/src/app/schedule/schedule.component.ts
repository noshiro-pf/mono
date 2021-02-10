import { Component, OnInit } from '@angular/core';
import { MatStepper, MatDialog } from '@angular/material';

import { RN, manual, merge, combine } from 'rnjs';

import { DatabaseService } from '../database/database.service';
import { ConfirmDialogComponent } from '../mylib/confirm-dialog.component';

import { Schedule, ScheduleSymbol } from './schedule-event';


@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  eventPageUrl = '';
  eventPageId = '';

  private readonly titleFromUI$             = manual<string>('');
  private readonly notesFromUI$             = manual<string>('');
  private readonly selectedDatetimesFromUI$ = manual<number[]>([]);
  private readonly answerDeadlineFromUI$    = manual<number>( Date.now() );
  private readonly symbolsFromUI$           = manual<ScheduleSymbol[]>([]);
  private readonly passwordFromUI$          = manual<string>('');
  private readonly passwordEnabledFromUI$   = manual<boolean>(false);

  readonly title$ = this.titleFromUI$;
  readonly notes$ = this.notesFromUI$;
  readonly selectedDatetimes$ = this.selectedDatetimesFromUI$;
  readonly answerDeadline$ = this.answerDeadlineFromUI$;
  readonly passwordEnabled$ = this.passwordEnabledFromUI$;

  readonly symbols$: RN<ScheduleSymbol[]>
    = this.symbolsFromUI$.withInitialValue([
        { id: 'fav',      useThis: false, score: 10, iconName: 'favorite',               description: 'できればこの日で' },
        { id: 'ok',       useThis: true,  score: 10, iconName: 'radio_button_unchecked', description: '参加可能' },
        { id: 'maybe',    useThis: true,  score:  5, iconName: 'change_history',         description: '行けるかも' },
        { id: 'depends',  useThis: false, score:  5, iconName: 'watch',                  description: '時間によります' },
        { id: 'late',     useThis: false, score:  5, iconName: 'schedule',               description: '遅れてなら参加可能' },
        { id: 'unknown',  useThis: false, score:  5, iconName: 'help_outline',           description: '分からない' },
        { id: 'ng',       useThis: true,  score:  0, iconName: 'clear',                  description: '参加不可' },
        { id: 'kusonemi', useThis: false, score:  0, iconName: 'hotel',                  description: '起きられません' },
      ]);

  readonly password$: RN<string>
    = merge( this.passwordFromUI$,
             this.passwordEnabledFromUI$.filter( true, b => b === false ).mapTo('') );

  readonly createEventButtonDisabled$: RN<boolean>
    = combine(
        this.title$,
        this.answerDeadline$,
        this.selectedDatetimes$,
        this.passwordEnabled$,
        this.password$
      ).map( ([
        title,
        answerDeadline,
        selectedDatetimes,
        passwordEnabled,
        password,
      ]) => (
        !title ||
        !selectedDatetimes || selectedDatetimes.length === 0 ||
        !answerDeadline ||
        (passwordEnabled && password === '')
      )).withInitialValue( false );


  constructor(
    public dialog: MatDialog,
    private database: DatabaseService
  ) {
  }

  ngOnInit() {
  }


  /* callback functions */
  titleChange( value: string ) {
    this.titleFromUI$.emit( value );
  }
  notesChange( value: string ) {
    this.notesFromUI$.emit( value );
  }
  selectedDatetimesChange( value: number[] ) {
    this.selectedDatetimesFromUI$.emit( value );
  }
  answerDeadlineChange( value: number ) {
    this.answerDeadlineFromUI$.emit( value );
  }
  symbolsChange( value: ScheduleSymbol[] ) {
    this.symbolsFromUI$.emit( value );
  }
  passwordChange( value: string ) {
    this.passwordFromUI$.emit( value );
  }

  passwordEnabledChange( value: boolean ) {
    this.passwordEnabledFromUI$.emit( value );
  }


  createEvent( stepper: MatStepper ) {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = 'イベントを作成します。よろしいですか？';
    dialogRef.componentInstance.OKstr = '作成';
    dialogRef.afterClosed().subscribe( result => {
      if ( result === 'yes' ) {
        const scEvent = new Schedule();
        scEvent.title             = this.titleFromUI$.value;
        scEvent.notes             = this.notesFromUI$.value;
        scEvent.selectedDatetimes = this.selectedDatetimesFromUI$.value;
        scEvent.answerDeadline    = this.answerDeadlineFromUI$.value;
        scEvent.symbols           = this.symbolsFromUI$.value;
        scEvent.password          = this.passwordFromUI$.value;
        const databaseKey = this.database.scheduling.addEvent( scEvent ).key || '';
        this.eventPageId = databaseKey;
        this.eventPageUrl = `${window.location.href}/answer/${this.eventPageId}`;
        stepper.next();
      }
    });
  }
}
