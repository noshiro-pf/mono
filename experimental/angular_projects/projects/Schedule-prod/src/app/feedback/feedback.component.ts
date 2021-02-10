import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { MatDialog } from '@angular/material';

import { DatabaseService } from '../database/database.service';
import { ConfirmDialogComponent } from '../mylib/confirm-dialog.component';
import { Feedback } from '../classes/feedback';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: [ '../mylib/data-table/data-table.component.css' ]
})
export class FeedbackComponent implements OnInit, OnDestroy {
  private alive = true;

  name = '';
  feedbackText = '';
  category: 'bugReport'|'suggestion'|'' = '';

  feedbacks: Feedback[] = [];

  constructor(
    private dialog: MatDialog,
    private database: DatabaseService
  ) {
    this.database.feedbacks$
      .pipe( takeWhile( () => this.alive ) )
      .subscribe( val => this.feedbacks = val );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  nameChange( value: string ) {
    this.name = value;
  }
  feedbackTextChange( value: string ) {
    this.feedbackText = value;
  }
  categoryChange( value: 'bugReport'|'suggestion'|'' ) {
    this.category = value;
  }

  submit() {
    const dialogRef = this.dialog.open( ConfirmDialogComponent );
    dialogRef.componentInstance.message = '送信してもよろしいですか？';
    dialogRef.afterClosed().subscribe( result => {
      if ( result === 'yes' ) {
        this.database.feedbacks.add( new Feedback( undefined, {
          name: this.name,
          content: this.feedbackText,
          timeStamp: Date.now(),
          closed: false,
          category: this.category,
        }) );
        this.name = '';
        this.feedbackText = '';
      }
    });
  }
}
