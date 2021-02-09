import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { RN, manual, combine, fromObservable } from 'rnjs';

import { DatabaseService } from '../../database/database.service';

import { Schedule } from '../schedule-event';
import { EditPasswordDialogComponent } from './edit-password-dialog.component';
import { utils } from '../../mylib/utilities';

@Component({
  selector: 'app-answer-page',
  templateUrl: './answer-page.component.html',
  styleUrls: [
    '../../mylib/data-table/data-table.component.css',
    './answer-page.component.css'
  ]
})
export class AnswerPageComponent implements OnInit, OnDestroy {
  private alive = true;

  readonly eventId$ = manual<string>('');

  readonly event$: RN<Schedule>
      = combine(
          this.database.schedulingEvents$,
          this.eventId$
        ).map( ([list, id]) =>
          list.find( e => e.databaseKey === id ) || new Schedule()
        );

  readonly answerDeadlineExpired$: RN<boolean>
      = this.event$.map( e =>
          utils.date.compare(
            Date.now(),
            utils.date.getTomorrowTimestamp( e.answerDeadline ) ) > 0 );

  readonly answerId$ = manual<string>('');


  readonly toYMD = utils.date.toYMD;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private database: DatabaseService,
  ) {
  }


  ngOnInit() {
    fromObservable( { get: (_: string) => '' } as ParamMap, this.route.paramMap )
      .map( params => params.get('eventId') )
      .takeWhile( () => this.alive )
      .listen( true, eventId => this.eventId$.emit( eventId ) );
  }

  ngOnDestroy(): void {
    this.alive = false;
  }


  answerIdOnChange( answerId: string ) {
    this.answerId$.emit( answerId );
  }

  editEvent( scEvent: Schedule, scEventId: string ) {
    const path = [`scheduling/edit-event/${scEventId}`];
    if ( !scEvent.password ) {
      this.router.navigate( path );
    } else {
      const dialogRef = this.dialog.open( EditPasswordDialogComponent );
      dialogRef.componentInstance.passwordAnswer = scEvent.password;
      dialogRef.afterClosed().subscribe( result => {
        if ( result === 'yes' ) this.router.navigate( path );
      });
    }
  }

  scrollTo( targetElement: any ) {
    targetElement.scrollIntoView();
  }
}
