import { Component, OnInit } from '@angular/core';

import { DatabaseService } from '../database/database.service';
import { Feedback } from '../types/feedback';
import { RN } from 'rnjs';

@Component({
  selector: 'app-feedback-admin',
  templateUrl: './feedback-admin.component.html',
  styleUrls: [ '../mylib/data-table/data-table.component.css' ]
})
export class FeedbackAdminComponent implements OnInit {

  readonly feedbacks$: RN<Feedback[]> = this.database.feedbacks$;

  constructor( private database: DatabaseService ) { }

  ngOnInit() { }

  issueClosedChange( feedbackId: string, value: boolean ) {
    this.database.feedbacks.closeIssue( feedbackId, value );
  }
}
