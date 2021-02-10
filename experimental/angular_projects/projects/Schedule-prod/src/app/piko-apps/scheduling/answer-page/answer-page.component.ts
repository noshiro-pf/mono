import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DatabaseService } from '../../../database/database.service';

import { Schedule } from '../scheduling-event';
import { EditPasswordDialogComponent } from './edit-password-dialog.component';
import { utils } from '../../../mylib/utilities';

@Component({
  selector: 'app-answer-page',
  templateUrl: './answer-page.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './answer-page.component.css'
  ]
})
export class AnswerPageComponent implements OnInit {

  eventId$!: Observable<string>;
  event$!: Observable<Schedule>;
  answerDeadlineExpired$!: Observable<boolean>;

  private answerIdSource = new BehaviorSubject<string>('');
  answerId$ = this.answerIdSource.asObservable();


  toYMD = utils.date.toYMD;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private database: DatabaseService,
  ) {
  }


  ngOnInit() {
    this.eventId$
      = this.route.paramMap
          .pipe( switchMap( (params: ParamMap) => params.getAll('eventId') ) );

    this.event$
      = combineLatest(
          this.database.schedulingEvents$,
          this.eventId$,
          (list, id) => list.find( e => e.databaseKey === id ) || new Schedule() );

    this.answerDeadlineExpired$
      = this.event$.pipe( map( e =>
          utils.date.compare( Date.now(), utils.date.getTomorrowTimestamp( e.answerDeadline ) ) > 0 ) );
  }


  answerIdOnChange( answerId: string ) {
    this.answerIdSource.next( answerId );
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
