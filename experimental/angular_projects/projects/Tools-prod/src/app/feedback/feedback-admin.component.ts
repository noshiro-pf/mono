import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { DatabaseService } from '../database/database.service';
import { Feedback } from '../classes/feedback';

@Component({
  selector: 'app-feedback-admin',
  template: `
    <div class="body-with-padding">
      <table class="data-table  shadow3px vertical-line">
        <thead>
          <tr>
            <th>Done</th>
            <th>Name</th>
            <th>Category</th>
            <th>Issue</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let fb of feedbacks">
            <td>
              <mat-checkbox
                [checked]="fb.closed"
                (change)="issueClosedChange( fb.databaseKey, $event.checked )">
              </mat-checkbox>
            </td>
            <td>{{fb.name}}</td>
            <td>
              <div [ngSwitch]="fb.category">
                <mat-icon *ngSwitchCase="'bugReport'" matTooltip="バグ報告">bug_report</mat-icon>
                <mat-icon *ngSwitchCase="'suggestion'" matTooltip="アイデアなど">lightbulb_outline</mat-icon>
                <span *ngSwitchDefault></span>
              </div>
            </td>
            <td class="data-table--cell-alignLeft">
              {{fb.content}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrls: [ '../mylib/data-table/data-table.component.css' ]
})
export class FeedbackAdminComponent implements OnInit, OnDestroy {
  private alive = true;

  feedbacks: Feedback[] = [];

  constructor(
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

  issueClosedChange( feedbackID: string, value: boolean ) {
    this.database.feedbacks.closeIssue( feedbackID, value );
  }

}
