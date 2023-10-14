import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RN } from 'rnjs';
import { DatabaseService } from '../database/database.service';
import { ConfirmDialogComponent } from '../mylib/confirm-dialog.component';
import { Feedback } from '../types/feedback';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['../mylib/data-table/data-table.component.css'],
})
export class FeedbackComponent implements OnInit {
  name = '';
  feedbackText = '';
  category: 'bugReport' | 'suggestion' | '' = '';

  readonly feedbacks$: RN<Feedback[]> = this.database.feedbacks$;

  constructor(
    private dialog: MatDialog,
    private database: DatabaseService
  ) {}

  ngOnInit() {}

  nameChange(value: string) {
    this.name = value;
  }
  feedbackTextChange(value: string) {
    this.feedbackText = value;
  }
  categoryChange(value: 'bugReport' | 'suggestion' | '') {
    this.category = value;
  }

  submit() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.message = '送信してもよろしいですか？';
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        this.database.feedbacks.add(
          new Feedback(undefined, {
            name: this.name,
            content: this.feedbackText,
            timeStamp: Date.now(),
            closed: false,
            category: this.category,
          })
        );
        this.name = '';
        this.feedbackText = '';
      }
    });
  }
}
